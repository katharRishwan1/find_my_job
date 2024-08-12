const { auth } = require("../controllers");
const { router } = require("../services/imports");

router.post('/signup', auth.signup);
router.post('/signin', auth.signin);
router.post('/otp/send', auth.sendOtp);
router.post('/otp/owner/send', auth.ownerSendOtp);
router.post('/otp/jb/send', auth.jobseekerSendOtp);
router.post('/otp/verify', auth.verifyOtp);
router.post('/change/password', auth.changePassword);
router.post('/forgot/password', auth.forgotPassword);
router.post('/reset/password', auth.resetPassword);
router.post('/reset/verify', auth.resetVerify);
module.exports = router;