import { __awaiter } from "tslib";
import { AsyncQueue } from "@/util/AsyncQueue";
import { SettingSchema } from "@/SettingsSchemas";
import { createNotice } from "@/util/createNotice";
import { State } from "@/util/State";
// the setting of slider
export const nodeSize = {
    min: 1,
    max: 10,
    step: 0.1,
    default: 3,
};
// export type GraphSetting = Exclude<SavedSetting["setting"], undefined>;
const corruptedMessage = "The setting is corrupted. You will not be able to save the setting. Please backup your data.json, remove it and reload the plugin. Then migrate your old setting back.";
/**
 * @remarks the setting will not keep the temporary setting. It will only keep the saved settings.
 */
export class MySettingManager {
    /**
     * @remarks don't forget to call `loadSettings` after creating this class
     */
    constructor(plugin) {
        this.setting = new State(DEFAULT_SETTING);
        this.asyncQueue = new AsyncQueue();
        /**
         * whether the setting is loaded successfully
         */
        this.isLoaded = false;
        this.plugin = plugin;
    }
    /**
     * this function will update the setting and save it to the json file. But it is still a sync function.
     * You should always use this function to update setting
     */
    updateSettings(updateFunc) {
        // update the setting first
        updateFunc(this.setting);
        // save the setting to json
        this.asyncQueue.push(this.saveSettings.bind(this));
        // return the updated setting
        return this.setting.value;
    }
    getSettings() {
        return this.setting.value;
    }
    /**
     * load the settings from the json file
     */
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            // load the data, this can be null if the plugin is used for the first time
            const loadedData = (yield this.plugin.loadData());
            console.log("loaded: ", loadedData);
            // if the data is null, then we need to initialize the data
            if (!loadedData) {
                this.setting.value = DEFAULT_SETTING;
                this.isLoaded = true;
                yield this.saveSettings();
                return this.setting.value;
            }
            const result = SettingSchema.safeParse(loadedData);
            // the data schema is wrong or the data is corrupted, then we need to initialize the data
            if (!result.success) {
                createNotice(corruptedMessage);
                console.warn("parsed loaded data failed", result.error.flatten());
                this.isLoaded = false;
                this.setting.value = DEFAULT_SETTING;
                return this.setting.value;
            }
            console.log("parsed loaded data successfully");
            this.setting.value = result.data;
            return this.setting.value;
        });
    }
    /**
     * save the settings to the json file
     */
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isLoaded) {
                // try to parse it again to see if it is corrupted
                const result = SettingSchema.safeParse(this.setting.value);
                if (!result.success) {
                    createNotice(corruptedMessage);
                    console.warn("parsed loaded data failed", result.error.flatten());
                    return;
                }
                this.isLoaded = true;
                console.log("parsed loaded data successfully");
            }
            yield this.plugin.saveData(this.setting.value);
        });
    }
}
export const DEFAULT_SETTING = {
    test: "test",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXR0aW5nTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUlyQyx3QkFBd0I7QUFDeEIsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHO0lBQ3ZCLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFLEVBQUU7SUFDUCxJQUFJLEVBQUUsR0FBRztJQUNULE9BQU8sRUFBRSxDQUFDO0NBQ1YsQ0FBQztBQWdDRiwwRUFBMEU7QUFFMUUsTUFBTSxnQkFBZ0IsR0FDckIsd0tBQXdLLENBQUM7QUFFMUs7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZ0JBQWdCO0lBVTVCOztPQUVHO0lBQ0gsWUFBWSxNQUFjO1FBWGxCLFlBQU8sR0FBbUIsSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckQsZUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7UUFFdEM7O1dBRUc7UUFDSyxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBTXhCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxjQUFjLENBQ2IsVUFBa0Q7UUFFbEQsMkJBQTJCO1FBQzNCLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsMkJBQTJCO1FBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkQsNkJBQTZCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDM0IsQ0FBQztJQUVELFdBQVc7UUFDVixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7T0FFRztJQUNHLFlBQVk7O1lBQ2pCLDJFQUEyRTtZQUMzRSxNQUFNLFVBQVUsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBbUIsQ0FBQztZQUVwRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVwQywyREFBMkQ7WUFDM0QsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsZUFBZSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDckIsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7YUFDMUI7WUFFRCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25ELHlGQUF5RjtZQUN6RixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDcEIsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsZUFBZSxDQUFDO2dCQUNyQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2FBQzFCO1lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1lBRS9DLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDakMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUMzQixDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNHLFlBQVk7O1lBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNuQixrREFBa0Q7Z0JBQ2xELE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFM0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7b0JBQ3BCLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUMvQixPQUFPLENBQUMsSUFBSSxDQUNYLDJCQUEyQixFQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUN0QixDQUFDO29CQUNGLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQzthQUMvQztZQUNELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDO0tBQUE7Q0FDRDtBQUVELE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBWTtJQUN2QyxJQUFJLEVBQUUsTUFBTTtDQUNaLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJU2V0dGluZ01hbmFnZXIgfSBmcm9tIFwiQC9JbnRlcmZhY2VzXCI7XHJcbmltcG9ydCB7IEFzeW5jUXVldWUgfSBmcm9tIFwiQC91dGlsL0FzeW5jUXVldWVcIjtcclxuaW1wb3J0IHsgU2V0dGluZ1NjaGVtYSB9IGZyb20gXCJAL1NldHRpbmdzU2NoZW1hc1wiO1xyXG5pbXBvcnQgeyBjcmVhdGVOb3RpY2UgfSBmcm9tIFwiQC91dGlsL2NyZWF0ZU5vdGljZVwiO1xyXG5pbXBvcnQgeyBTdGF0ZSB9IGZyb20gXCJAL3V0aWwvU3RhdGVcIjtcclxuaW1wb3J0IHsgUGx1Z2luIH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCB7IHogfSBmcm9tIFwiem9kXCI7XHJcblxyXG4vLyB0aGUgc2V0dGluZyBvZiBzbGlkZXJcclxuZXhwb3J0IGNvbnN0IG5vZGVTaXplID0ge1xyXG5cdG1pbjogMSxcclxuXHRtYXg6IDEwLFxyXG5cdHN0ZXA6IDAuMSxcclxuXHRkZWZhdWx0OiAzLFxyXG59O1xyXG5cclxuLy8gZXhwb3J0IHR5cGUgQmFzZUZpbHRlclNldHRpbmdzID0gUHJldHRpZnk8XHJcbi8vIFx0ei5UeXBlT2Y8dHlwZW9mIEJhc2VGaWx0ZXJTZXR0aW5nc1NjaGVtYT5cclxuLy8gPjtcclxuXHJcbi8vIGV4cG9ydCB0eXBlIExvY2FsRmlsdGVyU2V0dGluZyA9IFByZXR0aWZ5PFxyXG4vLyBcdHouVHlwZU9mPHR5cGVvZiBMb2NhbEZpbHRlclNldHRpbmdTY2hlbWE+XHJcbi8vID47XHJcblxyXG4vLyBleHBvcnQgdHlwZSBHcm91cFNldHRpbmdzID0gUHJldHRpZnk8ei5UeXBlT2Y8dHlwZW9mIEdyb3VwU2V0dGluZ3NTY2hlbWE+PjtcclxuXHJcbi8vIGV4cG9ydCB0eXBlIEJhc2VEaXNwbGF5U2V0dGluZ3MgPSBQcmV0dGlmeTxcclxuLy8gXHR6LlR5cGVPZjx0eXBlb2YgQmFzZURpc3BsYXlTZXR0aW5nc1NjaGVtYT5cclxuLy8gPjtcclxuXHJcbi8vIGV4cG9ydCB0eXBlIExvY2FsRGlzcGxheVNldHRpbmdzID0gUHJldHRpZnk8XHJcbi8vIFx0ei5UeXBlT2Y8dHlwZW9mIExvY2FsRGlzcGxheVNldHRpbmdzU2NoZW1hPlxyXG4vLyA+O1xyXG5cclxuLy8gZXhwb3J0IHR5cGUgR2xvYmFsR3JhcGhTZXR0aW5ncyA9IFByZXR0aWZ5PFxyXG4vLyBcdHouVHlwZU9mPHR5cGVvZiBHbG9iYWxHcmFwaFNldHRpbmdzU2NoZW1hPlxyXG4vLyA+O1xyXG5cclxuLy8gZXhwb3J0IHR5cGUgTG9jYWxHcmFwaFNldHRpbmdzID0gUHJldHRpZnk8XHJcbi8vIFx0ei5UeXBlT2Y8dHlwZW9mIExvY2FsR3JhcGhTZXR0aW5nc1NjaGVtYT5cclxuLy8gPjtcclxuXHJcbi8vIGV4cG9ydCB0eXBlIFNhdmVkU2V0dGluZyA9IFByZXR0aWZ5PHouVHlwZU9mPHR5cGVvZiBTYXZlZFNldHRpbmdTY2hlbWE+PjtcclxuXHJcbmV4cG9ydCB0eXBlIFNldHRpbmcgPSBQcmV0dGlmeTx6LlR5cGVPZjx0eXBlb2YgU2V0dGluZ1NjaGVtYT4+O1xyXG5cclxuLy8gZXhwb3J0IHR5cGUgR3JhcGhTZXR0aW5nID0gRXhjbHVkZTxTYXZlZFNldHRpbmdbXCJzZXR0aW5nXCJdLCB1bmRlZmluZWQ+O1xyXG5cclxuY29uc3QgY29ycnVwdGVkTWVzc2FnZSA9XHJcblx0XCJUaGUgc2V0dGluZyBpcyBjb3JydXB0ZWQuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIHNhdmUgdGhlIHNldHRpbmcuIFBsZWFzZSBiYWNrdXAgeW91ciBkYXRhLmpzb24sIHJlbW92ZSBpdCBhbmQgcmVsb2FkIHRoZSBwbHVnaW4uIFRoZW4gbWlncmF0ZSB5b3VyIG9sZCBzZXR0aW5nIGJhY2suXCI7XHJcblxyXG4vKipcclxuICogQHJlbWFya3MgdGhlIHNldHRpbmcgd2lsbCBub3Qga2VlcCB0aGUgdGVtcG9yYXJ5IHNldHRpbmcuIEl0IHdpbGwgb25seSBrZWVwIHRoZSBzYXZlZCBzZXR0aW5ncy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBNeVNldHRpbmdNYW5hZ2VyIGltcGxlbWVudHMgSVNldHRpbmdNYW5hZ2VyPFNldHRpbmc+IHtcclxuXHRwcml2YXRlIHBsdWdpbjogUGx1Z2luO1xyXG5cdHByaXZhdGUgc2V0dGluZzogU3RhdGU8U2V0dGluZz4gPSBuZXcgU3RhdGUoREVGQVVMVF9TRVRUSU5HKTtcclxuXHRwcml2YXRlIGFzeW5jUXVldWUgPSBuZXcgQXN5bmNRdWV1ZSgpO1xyXG5cclxuXHQvKipcclxuXHQgKiB3aGV0aGVyIHRoZSBzZXR0aW5nIGlzIGxvYWRlZCBzdWNjZXNzZnVsbHlcclxuXHQgKi9cclxuXHRwcml2YXRlIGlzTG9hZGVkID0gZmFsc2U7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZW1hcmtzIGRvbid0IGZvcmdldCB0byBjYWxsIGBsb2FkU2V0dGluZ3NgIGFmdGVyIGNyZWF0aW5nIHRoaXMgY2xhc3NcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihwbHVnaW46IFBsdWdpbikge1xyXG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgdXBkYXRlIHRoZSBzZXR0aW5nIGFuZCBzYXZlIGl0IHRvIHRoZSBqc29uIGZpbGUuIEJ1dCBpdCBpcyBzdGlsbCBhIHN5bmMgZnVuY3Rpb24uXHJcblx0ICogWW91IHNob3VsZCBhbHdheXMgdXNlIHRoaXMgZnVuY3Rpb24gdG8gdXBkYXRlIHNldHRpbmdcclxuXHQgKi9cclxuXHR1cGRhdGVTZXR0aW5ncyhcclxuXHRcdHVwZGF0ZUZ1bmM6IChzZXR0aW5nOiB0eXBlb2YgdGhpcy5zZXR0aW5nKSA9PiB2b2lkXHJcblx0KTogU2V0dGluZyB7XHJcblx0XHQvLyB1cGRhdGUgdGhlIHNldHRpbmcgZmlyc3RcclxuXHRcdHVwZGF0ZUZ1bmModGhpcy5zZXR0aW5nKTtcclxuXHRcdC8vIHNhdmUgdGhlIHNldHRpbmcgdG8ganNvblxyXG5cdFx0dGhpcy5hc3luY1F1ZXVlLnB1c2godGhpcy5zYXZlU2V0dGluZ3MuYmluZCh0aGlzKSk7XHJcblx0XHQvLyByZXR1cm4gdGhlIHVwZGF0ZWQgc2V0dGluZ1xyXG5cdFx0cmV0dXJuIHRoaXMuc2V0dGluZy52YWx1ZTtcclxuXHR9XHJcblxyXG5cdGdldFNldHRpbmdzKCk6IFNldHRpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2V0dGluZy52YWx1ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIGxvYWQgdGhlIHNldHRpbmdzIGZyb20gdGhlIGpzb24gZmlsZVxyXG5cdCAqL1xyXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcclxuXHRcdC8vIGxvYWQgdGhlIGRhdGEsIHRoaXMgY2FuIGJlIG51bGwgaWYgdGhlIHBsdWdpbiBpcyB1c2VkIGZvciB0aGUgZmlyc3QgdGltZVxyXG5cdFx0Y29uc3QgbG9hZGVkRGF0YSA9IChhd2FpdCB0aGlzLnBsdWdpbi5sb2FkRGF0YSgpKSBhcyB1bmtub3duIHwgbnVsbDtcclxuXHJcblx0XHRjb25zb2xlLmxvZyhcImxvYWRlZDogXCIsIGxvYWRlZERhdGEpO1xyXG5cclxuXHRcdC8vIGlmIHRoZSBkYXRhIGlzIG51bGwsIHRoZW4gd2UgbmVlZCB0byBpbml0aWFsaXplIHRoZSBkYXRhXHJcblx0XHRpZiAoIWxvYWRlZERhdGEpIHtcclxuXHRcdFx0dGhpcy5zZXR0aW5nLnZhbHVlID0gREVGQVVMVF9TRVRUSU5HO1xyXG5cdFx0XHR0aGlzLmlzTG9hZGVkID0gdHJ1ZTtcclxuXHRcdFx0YXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuc2V0dGluZy52YWx1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCByZXN1bHQgPSBTZXR0aW5nU2NoZW1hLnNhZmVQYXJzZShsb2FkZWREYXRhKTtcclxuXHRcdC8vIHRoZSBkYXRhIHNjaGVtYSBpcyB3cm9uZyBvciB0aGUgZGF0YSBpcyBjb3JydXB0ZWQsIHRoZW4gd2UgbmVlZCB0byBpbml0aWFsaXplIHRoZSBkYXRhXHJcblx0XHRpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XHJcblx0XHRcdGNyZWF0ZU5vdGljZShjb3JydXB0ZWRNZXNzYWdlKTtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwicGFyc2VkIGxvYWRlZCBkYXRhIGZhaWxlZFwiLCByZXN1bHQuZXJyb3IuZmxhdHRlbigpKTtcclxuXHRcdFx0dGhpcy5pc0xvYWRlZCA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLnNldHRpbmcudmFsdWUgPSBERUZBVUxUX1NFVFRJTkc7XHJcblx0XHRcdHJldHVybiB0aGlzLnNldHRpbmcudmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc29sZS5sb2coXCJwYXJzZWQgbG9hZGVkIGRhdGEgc3VjY2Vzc2Z1bGx5XCIpO1xyXG5cclxuXHRcdHRoaXMuc2V0dGluZy52YWx1ZSA9IHJlc3VsdC5kYXRhO1xyXG5cdFx0cmV0dXJuIHRoaXMuc2V0dGluZy52YWx1ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIHNhdmUgdGhlIHNldHRpbmdzIHRvIHRoZSBqc29uIGZpbGVcclxuXHQgKi9cclxuXHRhc3luYyBzYXZlU2V0dGluZ3MoKSB7XHJcblx0XHRpZiAoIXRoaXMuaXNMb2FkZWQpIHtcclxuXHRcdFx0Ly8gdHJ5IHRvIHBhcnNlIGl0IGFnYWluIHRvIHNlZSBpZiBpdCBpcyBjb3JydXB0ZWRcclxuXHRcdFx0Y29uc3QgcmVzdWx0ID0gU2V0dGluZ1NjaGVtYS5zYWZlUGFyc2UodGhpcy5zZXR0aW5nLnZhbHVlKTtcclxuXHJcblx0XHRcdGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcclxuXHRcdFx0XHRjcmVhdGVOb3RpY2UoY29ycnVwdGVkTWVzc2FnZSk7XHJcblx0XHRcdFx0Y29uc29sZS53YXJuKFxyXG5cdFx0XHRcdFx0XCJwYXJzZWQgbG9hZGVkIGRhdGEgZmFpbGVkXCIsXHJcblx0XHRcdFx0XHRyZXN1bHQuZXJyb3IuZmxhdHRlbigpXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuaXNMb2FkZWQgPSB0cnVlO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcInBhcnNlZCBsb2FkZWQgZGF0YSBzdWNjZXNzZnVsbHlcIik7XHJcblx0XHR9XHJcblx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlRGF0YSh0aGlzLnNldHRpbmcudmFsdWUpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElORzogU2V0dGluZyA9IHtcclxuXHR0ZXN0OiBcInRlc3RcIixcclxufTtcclxuIl19