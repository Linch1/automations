const Fastify = require('fastify');
const cors = require('@fastify/cors');
const fs = require('fs');
const path = require('path');
const { default: Paths } = require('./Paths');
const { default: ServerUtils } = require('../utils/ServerUtils');
const { default: Ws } = require('./Ws');
const { default: MessageType } = require('../../../shared/MessageType.js');

const PORT = 6001;
const PUBLIC_DIR = Paths.DOWNLOADS_DIR;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

const fastify = Fastify();

// Register CORS
fastify.register(cors, {
  origin: '*', // Customize as needed
});

// Serve static files manually (basic version)
fastify.get('/*', async (request, reply) => {
  
  const urlPath = request.params['*'] || 'index.html';
  const filePath = path.join(PUBLIC_DIR, urlPath);

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    reply.code(403).send('Access denied');
    return;
  }

  try {
    const data = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    reply.header('Content-Type', contentType).send(data);
  } catch (err) {
    reply.code(404).send('File not found');
  }
});

// Add custom endpoint
fastify.get('/users', async (request, reply) => {
  request.query.liked = request.query.liked === "true";
  request.query.uploaded = request.query.uploaded === "true";

  return {status: true, response: await ServerUtils.traverseDownloads(request.query.liked, request.query.uploaded)};
});

fastify.get('/swipe', async (request, reply) => {
  ServerUtils.markPostAsSwiped(request.query)
  return {status: true};
});

fastify.get('/upload', async (request, reply) => {
  let {platform, username, postId, isVideo, direction} =  request.query;
  
  let profile = await ServerUtils.findProfileThatManageUsername(username);
  let post  = await ServerUtils.getPostInformations({platform, username, postId});

  let socket = Ws.connections.get(profile.name);
  if(!socket){
    console.log("missing socket for profile=", profile.name);
    return {status: false, error: "Client socket is not connected to server"};
  } else if( ServerUtils.wasAlreadyUploaded(platform, username, postId) ) {
    console.log("post already uploaded. post id=", postId)
    return {status: false, error: "This post was already uploaded"};
  }

  console.log("sending create post request for post id=", postId)
  
  ServerUtils.addUploadedPostToUser(platform, username, postId);

  let type = isVideo?"video":"image";

  let caption = profile.default_caption || post.caption;
  caption = caption.replaceAll(username, profile.accounts[platform].username)
 
  socket.send({
    type: MessageType.CREATE_POST,
    payload: {
      platform, 
      username,
      postId,
      type,

      profile: profile.name, 
      url: ServerUtils.getPlatformUrl(platform), 
      fileUrl: Paths.getPostMediaUrl(platform, username, postId, type),
      caption: 
    }
  })
  
  return {status: true};
});


// Start server
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
