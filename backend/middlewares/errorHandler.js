// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Logs the error stack to the console for debugging
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error', // Sends error message to the client
    });
};

export default  errorHandler;
