const { role } = require("../controllers");
const { router } = require("../services/imports");

router.get('/role/:id?', role.get);
router.post('/role', role.post);
router.put('/role/:id', role.update);
router.delete('/role/:id', role.delete);
router.post('/role-status/:id', role.status)
module.exports = router;