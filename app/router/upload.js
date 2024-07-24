const { upload } = require("../controllers");
const { router } = require('../services/imports');

router.post('/upload', upload.singleFileUpload);
router.post('/auth/upload', upload.singleFileUpload);
router.post('/mulit_upload', upload.awsMultiUpload);
router.post('/auth/mulit_upload', upload.awsMultiUpload);

module.exports = router;
