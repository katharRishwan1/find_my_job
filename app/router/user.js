const { router } = require('../services/imports')
const { user } = require('../controllers/index')


router.post('/user', user.createUser)
router.get('/user/:id?', user.getUser);
router.put('/user/:id', user.updateUser);
// router.delete('/role/:id', role.delete);
// router.post('/role-status/:id', role.status
router.get('/pincode', user.pincode)
router.get('/profile', user.profileGet)
module.exports = router