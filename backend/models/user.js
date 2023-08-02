class Auth {
    constructor(status, msg) {
        super(stack);
        this.status = status;
        this.msg = msg;
        console.error(this.stack);
    };
}

module.exports = ExpressError;