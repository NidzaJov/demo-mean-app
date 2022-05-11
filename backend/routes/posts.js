const express = require('express');

const PostsController = require('../controllers/posts')

const extractFile = require("../middleware/file")
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

router.post(
  "",
  checkAuth,
  extractFile,
  PostsController.cretePost
  )

router.put(
  "/:id",
  checkAuth,
  extractFile,
  PostsController.updatePost
  )

router.get("", PostsController.getPosts);

router.get('/:id', PostsController.getPost)

router.delete("/:id", checkAuth, PostsController.deletePost);

module.exports = router;
