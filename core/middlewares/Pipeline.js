class Pipeline {
    constructor() {
        this.middlewares = [];
    }
    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }
    async execute(context, targetExecutor) {
        let index = -1;
        const next = async () => {
            index++;
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index];
                await middleware(context, next);
            } else {
                await targetExecutor(context);
            }
        };
        await next();
    }
}
module.exports = Pipeline;