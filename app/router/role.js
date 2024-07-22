const { role } = require("../controllers");
const { router } = require("../services/imports");

router.get('/role', role.get);
router.post('/role',role.post);
router.put('/role/:id', role.update);
router.delete('/role/:id', role.delete);
module.exports = router;