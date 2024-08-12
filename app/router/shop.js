const { shop } = require("../controllers");
const { checkRoles } = require("../middlewares");
const { router } = require("../services/imports");

router.get('/shop/:id?', checkRoles(['ad', 'own', 'jb']), shop.get);
router.post('/shop/adminCreate', checkRoles(['ad']), shop.adminShopCreate);  // this is for admin
router.post('/shop', checkRoles(['own']), shop.ownerOnboarding)   // this is for owner
// router.put('/shop/:id', shop.update);
// router.delete('/shop/:id', shop.delete);
// router.post('/shop-status/:id', shop.status)
module.exports = router;