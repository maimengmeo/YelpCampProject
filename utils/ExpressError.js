class ExpressError extends Error {
    constructor(mesage, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exposts = ExpressError;
