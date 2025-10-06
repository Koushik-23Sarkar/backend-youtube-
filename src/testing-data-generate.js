// every User :
        // 2 video, 5 tweets , 3 comment in the video , subscribed , 

import { faker, vi } from "@faker-js/faker";
import { User } from "./models/user.model.js";

import mongoose from "mongoose";
import { Video } from "./models/video.model.js";
import { Tweet } from "./models/tweet.model.js";
import { Comment } from "./models/comment.model.js";
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

async function createPlaylistForUser(params) {
  
}

async function subscribedTo(subscriber,channel) {   // subscriber subscribedTo channel
  
}

async function createLike(userId,{video,comment,tweet}) {
  
}

async function run() {
  try {
    await testConnectDB();
    await getAllUser();
    await getAllVideo();
    await createCommentForUser(selectRandomUser(0,18,videoArray),selectRandomUser(0,6,userArray));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected ✅");
  }
}

run();
