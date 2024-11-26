const express = require('express');
const { fileUploadController } = require('../controllers/fileUploadController');
const multer = require('multer');
const { fetchCollectionNameController } = require('../controllers/fetchCollectionNameController');
const { mapController } = require('../controllers/mapController');
const { fetchKeysController } = require('../controllers/fetchKeysController');
const { mostMatchController } = require('../controllers/mostMatchController');
const { removeDuplicateID } = require('../controllers/removeDuplicateID');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

//upload file
router.post("/upload", upload.single('csv'), fileUploadController);

//fetch collection Names
router.get("/fetchCollection",fetchCollectionNameController);

//fetch keys of master1
router.post("/fetchKeys",fetchKeysController);

//Map function
router.post("/map",mapController);

//Most Map function
router.post("/mostMatch",mostMatchController);

//Remove DuplicateID's function
router.post("/removeDuplicate",removeDuplicateID);

module.exports = router;