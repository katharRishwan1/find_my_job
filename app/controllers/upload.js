const AWS = require('aws-sdk');
const fs = require('fs');
const { awsAccessKey, awsSecretKey, awsBucketName } = require('../config/config');
const multer = require('multer');

const storage = multer.diskStorage({
    filename(req, file, cb) {
        const newFilename = file.originalname;
        cb(null, newFilename);
    },
});
const multiUploads = multer({ storage }).any();

const upload = multer({ storage }).single('file');
// Set your AWS credentials and S3 bucket details
// const localFilePath = 'path/to/local/file.txt'; // Path to the local file you want to upload
const s3FileKey = 'public/printon/'; // Key (path) in S3 where you want to store the file

// Configure the AWS SDK
const s3 = new AWS.S3({
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretKey
});


// Read the file to be uploaded
const uploadToS3 = async (file, folder = '') => {
    const fileContent = fs.readFileSync(file.path);
    const keyName = folder + file.filename;
    // Read content from the file
    const params = {
        Bucket: awsBucketName,
        Key: keyName, // File name you want to save as in S3
        Body: fileContent,
        ContentType: file.mimetype,
        ContentLength: file.size,
        ACL: 'public-read',
    };
    console.log('params', params);

    return new Promise((resolve, reject) => {
        try {
            s3.upload(params, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('data', data);
                console.log(`File uploaded successfully. ${data.Location}`);
                resolve({ location: data.Location, key: params.Key });
            });
        } catch (error) {
            //   return res.clientError({
            //     msg: `File upload Exception : ${error?.message}`,
            //     error
            //   });
            reject(error);
        }
    });
};
module.exports = {
    singleFileUpload: async (req, res) => {
        console.log('single upload');
        try {
            return upload(req, res, async (err) => {
                const allowedMimeTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/x-png',
                ]
                if (!allowedMimeTypes.includes(req.file.mimetype)) {
                    return res.clientError({
                        msg: 'Please select file of PNG,JPG files only',
                    })
                }
                if (req.file.size > 5242880) {
                    return res.clientError({
                        msg: 'Please select file size less than 5 MB',
                    })
                }

                if (err instanceof multer.MulterError) {
                    return res.clientError({
                        msg: 'Multer, please try again...',
                        error: err,
                    });
                }
                if (err) {
                    console.log('err', err);
                    return res.clientError({
                        msg: 'Not able to upload file, please try again...',
                        error: err,
                    });
                }
                const { file } = req;
                const folderPath = `printon`;
                const response = await new Promise((resolve, reject) => {
                    uploadToS3(file, folderPath)
                        .then((awsres) => {
                            resolve(awsres);
                        })
                        .catch((awserr) => {
                            reject(awserr);
                        });
                });
                if (response && response.location) {
                    return res.success({
                        result: [{ location: response.location }],
                        msg: 'File Upload successfully!!!',
                    });
                }
                return res.clientError({
                    result: response,
                    msg: 'Something went wrong',
                });
            });
        } catch (error) {
            return res.clientError({
                msg: `File upload Exception : ${error?.message}`,
                error,
            });
        }
    },
    awsMultiUpload: async (req, res) => {
        console.log('mulit upload was running successfully---------');
        try {
            console.log('req.file----', req.files);
            return multiUploads(req, res, async (err) => {
                const { path } = req.body;
                let fileSizeError = false;
                let fileTypeError = false;
                req.files.map((fil) => {
                    if (fil.size > 5242880) {
                        fileSizeError = true
                    }
                    const allowedMimeTypes = [
                        'image/jpeg',
                        'image/png',
                        'image/x-png',
                    ]

                    if (!allowedMimeTypes.includes(fil.mimetype)) {
                        fileTypeError = true
                    }
                })
                if (fileTypeError) {
                    return res.clientError({
                        msg: 'Please select file of PNG,JPG files only',
                    })
                }
                if (fileSizeError) {
                    return res.clientError({
                        msg: 'Please select file size less than 5 MB',
                    })
                }

                // if (!path)
                //     return res.json({ status: false, message: ['Path is required.'], data: [] })
                if (err instanceof multer.MulterError) {
                    return res.clientError({
                        msg: 'Multer, please try again...',
                        error: err,
                    });
                }
                if (err) {
                    return res.clientError({
                        msg: 'Not able to upload file, please try again...',
                        error: err,
                    });
                }

                const { files } = req;
                console.log('files in upload', files);
                const awsListUpload = [];

                await Promise.all(
                    files.map(async (file) => {
                        const folder = path;
                        const upres1 = await new Promise((resolve, reject) => {
                            uploadToS3(file, folder)
                                .then((awsres) => {
                                    resolve(awsres);
                                })
                                .catch((awserr) => {
                                    reject(awserr);
                                });
                        });

                        // const fileRes = files.map(({ path, destination, fieldname, ...rest }) => ({ location: upres1.location, key: upres1.key, ...rest }));

                        awsListUpload.push({ location: upres1.location });
                    })
                );

                if (awsListUpload && awsListUpload.length) {
                    return res.success({
                        result: awsListUpload,
                        msg: 'File Upload successfully!!!',
                    });
                }
                return res.clientError({
                    msg: 'Not able to upload file, please try again...',
                });
            });
        } catch (error) {
            return res.clientError({
                msg: `File upload Exception : ${error?.message}`,
                error,
            });
        }
    }
}

// Set up the S3 upload parameters
