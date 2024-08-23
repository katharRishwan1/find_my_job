const { owner } = require("../controllers");
const { checkRoles } = require("../middlewares");
const { router } = require("../services/imports");

router.get('/owner/:id?', checkRoles(['ad', 'own', 'jb']), owner.get);
router.post('/owner/adminCreate', checkRoles(['ad']), owner.adminownerCreate);  // this is for admin
router.post('/owner', checkRoles(['own']), owner.ownerOnboarding)   // this is for owner
// router.put('/owner/:id', owner.update);
// router.delete('/owner/:id', owner.delete);
// router.post('/owner-status/:id', owner.status)
module.exports = router;