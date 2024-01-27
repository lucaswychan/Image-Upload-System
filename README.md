<div align="center">
  
  <a href="https://jquery.com">
    <img src="https://img.shields.io/badge/React-0769AD?style=for-the-badge&logo=react&logoColor=sky" alt="ReactJS">
  </a>
  <a href="https://nodejs.org/en">
    <img src="https://img.shields.io/badge/Node.js-green?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS">
  </a>
  <a href="https://www.mongodb.com/">
    <img src="https://img.shields.io/badge/MongoDB-0A3C27?style=for-the-badge&logo=mongodb" alt="MongoDB">
  </a>
</div>

# Image Upload System
Using React.js and Node.js to implement an image upload system.

Perform checking for the images
<ul>
  <li>Size less than 5 Mb each</li>
  <li>Background needs to be transparent</li>
  <li>Must be in PNG format</li>
</ul> 
Once checking is done, upload the images to MongoDB with parameters 1) _id 2) name 3) array [dimension height, dimension width]



## Run Code
1. create file `.env` in the root directory to store your environment variables by copying the structure below
```
PORT=

#DB
DB_USER=
DB_PASSWORD=
```
2. run the commands below
```
$ npm install
$ cd server
$ node index.js
```
3. open another terminal and run the commands below
```
$ cd client
$ npm install
$ cd src
$ node index.js
```
