const { jobType } = require("../controllers");
const { router } = require("../services/imports");

router.get('/jobType/:id?', jobType.get);
router.post('/jobType', jobType.post);
router.put('/jobType/:id', jobType.update);
router.delete('/jobType/:id', jobType.delete);
router.post('/jobType-status/:id', jobType.status)
module.exports = router;