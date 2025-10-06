// every User :
        // 2 video, 5 tweets , 3 comment in the video , subscribed , 

import { faker, vi } from "@faker-js/faker";
import { User } from "../src/models/user.model.js";

import mongoose from "mongoose";
import { Video } from "../src/models/video.model.js";
import { Tweet } from "../src/models/tweet.model.js";
import { Comment } from "../src/models/comment.model.js";
import { Subscription } from "../src/models/subscription.model.js";
import { Playlist } from "../src/models/playlist.model.js";
const DB_NAME = "videotube";
const MONGODB_URI = "mongodb://localhost:27017";

const testConnectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

const CLOUD_NAME = "demo";

function fakeCloudinaryURL(type, width=200, height=200) {
  const fakePublicId = faker.string.alphanumeric(12);
  let format = faker.helpers.arrayElement(["jpg", "png"]);
  if(type=="video"){
    format="mp4";
  }
  const transformation = `w_${width},h_${height},c_fill`;

  return `https://res.cloudinary.com/${CLOUD_NAME}/${type}/upload/${transformation}/${fakePublicId}.${format}`;
}

function generateUser(idx) {
  const options = {
    username: faker.internet.username(),
    email: faker.internet.email(),
    fullName: faker.person.fullName(),
    avatar: fakeCloudinaryImageURL(`avater_${idx}`),
    coverImage: fakeCloudinaryImageURL(`coverImage_${idx}`),
    password: faker.internet.password({ length: 12 }),
  };
  return options;
}

const generateFiveUser = async () => {
  for (var i = 0; i < 5; i++) {
    // creating five user
    await User.create(generateUser(i));
  }

  console.log("users are generated!");
};

function selectRandomUser(maxUser, minUser, userArray) {
  // only give you ObjectId as string
  const number = Math.floor(Math.random()*(maxUser-minUser+1))+minUser;
  return userArray[number];
}

let userArray = [];
let videoArray = [];

async function getAllUser() {
  const user = await User.aggregate([
    {
      $project: {
        _id: { $toString: "$_id" }
      },
    },
  ]);
  userArray = [...user];
}

async function getAllVideo() {
  const video = await Video.aggregate([
    {
      $project: {
        _id: { $toString: "$_id" }
      },
    },
  ]);
  videoArray = [...video];
}



async function createVideoForUser(userId) {
    console.log("under the createVideoForUser")
    // create video for that use
    const options = {
        videoFile:fakeCloudinaryURL("video"),
        thumbnail:fakeCloudinaryURL("image"),
        title: faker.string.alphanumeric(20),
        description: faker.string.alphanumeric(40),
        duration: faker.number.int({ min: 10, max: 100 }),
        views: faker.number.int({ min: 10, max: 100 }),
        isPublished: true,
        owner: userId
    }

    await Video.create(options);
}

async function createTweetsForUser(userId) {
  // create tweets for that user
  const options = {
    content: faker.string.alphanumeric(40),
    owner: userId
  }

  await Tweet.create(options);
}

async function createCommentForUser(video,owner) {
  const options = {
    content: faker.string.alphanumeric(40),
    video: video,
    owner: owner
  }

  await Comment.create(options);
}

async function createPlaylistForUser(userId,video1,video2) {
  const options = {
    name: faker.animal.type(),
    description: faker.string.alphanumeric(40),
    videos: [video1,video2],
    owner: userId
  }
  await Playlist.create(options);
}

function select2User(maxUser, minUser, userArray) {
  const number1 = Math.floor(Math.random()*(maxUser-minUser+1))+minUser;
  const number2 = Math.floor(Math.random()*(maxUser-minUser+1))+minUser;
    if(number1==number2){
      select2User(maxUser,minUser,userArray);
    }else{
      return {user1: userArray[number1],user2: userArray[number2]};
    }
}

async function subscribedTo(subscriber,channel) {   // subscriber subscribedTo channel
  const options = {
    subscriber: subscriber,
    channel: channel
  }

  await Subscription.create(options);
}

async function createLike(userId,thingId) {
  
}

async function run() {
  try {
    await testConnectDB();
    await getAllUser();
    await getAllVideo();
    const {user1,user2} = select2User(0,6,videoArray);
    console.log(user1._id);
    console.log(user2._id);
    await createPlaylistForUser(selectRandomUser(0,6,userArray),user1._id,user2._id);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected ✅");
  }
}

run();
