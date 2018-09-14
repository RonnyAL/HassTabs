class HomeAssistant {
    constructor(url, pass) {
        this._url = url;
        this._pass = pass;
    }


    getConfig() {
        return this.getJson("/api/config");
    }

    getStates() {
        return this.getJson("/api/states");
    }

    getServices() {
        return this.getJson("/api/services");
    }

    getJson(path, url=this._url, pass=this._pass) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();

            xhr.timeout = 2000;
            xhr.open('GET', url + path, true);
            xhr.setRequestHeader("x-ha-access", pass);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send();
            xhr.onreadystatechange = processRequest;

            function processRequest() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        let response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } else {
                        console.log("An error occured: " + xhr.status);
                        reject(xhr.status);
                    }
                }
            }
        })
    }
}