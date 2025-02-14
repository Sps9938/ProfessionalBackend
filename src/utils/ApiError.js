class ApiError extends Error {
    /*
       Q. What extends Error Does
    When ApiError extends Error, it inherits important properties and methods from JavaScript’s built-in Error class, including:
    
    message → Stores the error message.

    stack → Provides the full stack trace.

    name → Identifies the error type as ApiError.
    
    Error handling compatibility → Works properly with instanceof Error in frameworks like Express.
    */




    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            //If stack is passed, it means the error was caught elsewhere. Keeping the original stack helps track the true source.
            this.stack = stack
        } else {

            /*
            -> stack is not provided
            -> Error.captureStackTrace(this, this.constructor)generates a new stack trace 
            -> The error object includes information about where it was created

            */
            Error.captureStackTrace(this, this.constructor)
        }

    }
}
export { ApiError }