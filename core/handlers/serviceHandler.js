const path = require('path');
const FileLoader = require('../utils/fileLoader');

class ServiceHandler {
    static load(client, dirToSearch) {
        const serviceFiles = FileLoader.getAllFiles(dirToSearch);
        
        for (const file of serviceFiles) {
            const service = require(path.resolve(file));
            
            if (!service.name || typeof service.execute !== 'function') {
                console.warn(`[WARNING] Сервис ${file} пропущен (отсутствует name или execute)`);
                continue;
            }
            
            client.servicesCount++;
            console.log(`[INFO] Загрузка сервиса: ${service.name}`);
            
            try {
                const serviceInstance = {
                    name: service.name,
                    interval: null,
                    isRunning: false,
                    stop: function() {
                        if (this.interval) {
                            clearInterval(this.interval);
                            this.interval = null;
                            this.isRunning = false;
                            console.log(`[INFO] Сервис ${this.name} остановлен`);
                        }
                    }
                };
                
                if (service.interval && service.interval > 0) {
                    serviceInstance.interval = setInterval(() => {
                        try { service.execute(client); } 
                        catch (error) { console.error(`[ERROR] Сервис ${service.name}:`, error); }
                    }, service.interval);
                    serviceInstance.isRunning = true;
                }
                
                if (service.immediate) {
                    try { service.execute(client); } 
                    catch (error) { console.error(`[ERROR] Сервис ${service.name} (immediate):`, error); }
                }
                
                client.services.push(serviceInstance);
                
            } catch (error) {
                console.error(`[ERROR] Не удалось загрузить сервис ${service.name}:`, error);
            }
        }
        console.log(`[INFO] Всего загружено сервисов: ${client.servicesCount}`);
    }
}

module.exports = ServiceHandler;