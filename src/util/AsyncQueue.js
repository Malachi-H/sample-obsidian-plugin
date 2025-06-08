import { __awaiter } from "tslib";
/**
 * this class is used to queue async tasks.
 */
export class AsyncQueue {
    constructor() {
        this.queue = [];
    }
    /**
     * push a task to the queue. If the queue is empty, the task will be executed immediately.
     */
    push(task) {
        this.queue.push(task);
        if (this.queue.length === 1) {
            this.run();
        }
    }
    /**
     * recursively run the tasks in the queue.
     * Stop when the queue is empty.
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const task = this.queue[0];
            if (!task)
                return;
            try {
                yield task();
            }
            catch (error) {
                console.error(`Error executing task: ${error}`);
            }
            finally {
                this.queue.shift();
            }
            yield this.run();
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXN5bmNRdWV1ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFzeW5jUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFVBQVU7SUFBdkI7UUFDa0IsVUFBSyxHQUFtQyxFQUFFLENBQUM7SUE0QjdELENBQUM7SUExQkM7O09BRUc7SUFDSCxJQUFJLENBQUMsSUFBZ0M7UUFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ1o7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ1csR0FBRzs7WUFDZixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU87WUFDbEIsSUFBSTtnQkFDRixNQUFNLElBQUksRUFBRSxDQUFDO2FBQ2Q7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ2pEO29CQUFTO2dCQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDcEI7WUFDRCxNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNuQixDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiB0aGlzIGNsYXNzIGlzIHVzZWQgdG8gcXVldWUgYXN5bmMgdGFza3MuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQXN5bmNRdWV1ZSB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHF1ZXVlOiAoKCkgPT4gUHJvbWlzZTx2b2lkPiB8IHZvaWQpW10gPSBbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogcHVzaCBhIHRhc2sgdG8gdGhlIHF1ZXVlLiBJZiB0aGUgcXVldWUgaXMgZW1wdHksIHRoZSB0YXNrIHdpbGwgYmUgZXhlY3V0ZWQgaW1tZWRpYXRlbHkuXHJcbiAgICovXHJcbiAgcHVzaCh0YXNrOiAoKSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5xdWV1ZS5wdXNoKHRhc2spO1xyXG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHRoaXMucnVuKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZWN1cnNpdmVseSBydW4gdGhlIHRhc2tzIGluIHRoZSBxdWV1ZS5cclxuICAgKiBTdG9wIHdoZW4gdGhlIHF1ZXVlIGlzIGVtcHR5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcnVuKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgdGFzayA9IHRoaXMucXVldWVbMF07XHJcbiAgICBpZiAoIXRhc2spIHJldHVybjtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHRhc2soKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGV4ZWN1dGluZyB0YXNrOiAke2Vycm9yfWApO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgdGhpcy5xdWV1ZS5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgYXdhaXQgdGhpcy5ydW4oKTtcclxuICB9XHJcbn1cclxuIl19