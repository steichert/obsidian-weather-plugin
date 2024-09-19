import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import queryString from 'query-string';
import fetch from 'node-fetch';
import { FeedbackResponse } from 'api/response/FeedbackResponse';
const moment = require('moment');

const getTimelineURL = "https://api.tomorrow.io/v4/timelines";

const fields = [
  "precipitationIntensity",
  "precipitationType",
  "windSpeed",
  "windGust",
  "windDirection",
  "temperature",
  "temperatureApparent",
  "cloudCover",
  "cloudBase",
  "cloudCeiling",
  "weatherCode",
];

interface WeatherSnippetSettings {
    apiKey: string;
    units: string;
    timezone: string;
    longitude: string;
    latitude: string;
}

const DEFAULT_SETTINGS: WeatherSnippetSettings = {
    apiKey: '',
    units: 'metric',
    timezone: 'Africa/Johannesburg',
    longitude: '27.981751405133167',
    latitude: '-26.114842711916268'
}

export default class WeatherSnippetPlugin extends Plugin {
    settings: WeatherSnippetSettings;

    async onload() {
        await this.loadSettings();

        this.addRibbonIcon('sun', 'Insert weather snippet', (evt: MouseEvent) => {
            
        });
        
        this.addSettingTab(new WeatherSnippetSettingTab(this.app, this));

        this.addCommand({
            id: "insert-current-weather",
            name: "Insert current weather",
            editorCallback: (editor: Editor) => {
                const now = moment.utc();
                const startTime = moment.utc(now).add(0, 'minutes').toISOString();
                const endTime = moment.utc(now).add(1, 'days').toISOString();
	
                const getTimelineParameters = queryString.stringify({
                    'apikey': this.settings.apiKey,
                    'location': [this.settings.latitude, this.settings.latitude],
                    'fields': fields,
                    'units': this.settings.units,
                    'timesteps': ['current'],
                    'startTime': startTime,
                    'endTime': endTime,
                    'timezone': this.settings.timezone,
                }, {arrayFormat: 'comma'});

                fetch(getTimelineURL + '?' + getTimelineParameters, {method: 'GET', compress: true})
                    .then((result: any) => result.json())
                    .then((response: FeedbackResponse) => {
                        editor.replaceRange(
                            this.constructHtmlOutput(response),
                            editor.getCursor()
                        );
                    })
                    .catch((error: any) => console.error('error: ' + error));               
            },
        });
    }

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

	constructHtmlOutput(response: FeedbackResponse) {
		let weatherCode = response.data.timelines[0].intervals[0].values.weatherCode;
		let temperature = response.data.timelines[0].intervals[0].values.temperature;

		let output = `<div><span src="../icons/png/10000_clear_large.png" alt="weather icon"><img></span><h3>Temperature: ${temperature}</h3><sub>Powered by Tomorrow.io</sub></div>`;
		
		return output;
	}
}

class WeatherSnippetSettingTab extends PluginSettingTab {
    plugin: WeatherSnippetPlugin;

    constructor(app: App, plugin: WeatherSnippetPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        this.buildSetting(containerEl, 'API Key', 'Tomorrow.io API Key', 'Enter your api key', this.plugin.settings.apiKey);
        this.buildSetting(containerEl, 'Units', 'Metric or imperial', 'Enter units', this.plugin.settings.units);

        // TODO: Fetch current location dynamically
        this.buildSetting(containerEl, 'Timezone', 'Location timezone', 'Enter timezone', this.plugin.settings.timezone);
        this.buildSetting(containerEl, 'Latitude', 'Latitude coordinate', 'Enter location latitude', this.plugin.settings.latitude);
        this.buildSetting(containerEl, 'Longitude', 'Longitude coordinate', 'Enter location longitude', this.plugin.settings.longitude);
    }

    private buildSetting(element: any, name: string, description: string, placeholder: string, targetName: string): void {
        new Setting(element)
            .setName(name)
            .setDesc(description)
            .addText(text => text
                .setPlaceholder(placeholder)
                .setValue(this.plugin.settings[targetName as keyof typeof this.plugin.settings])
                .onChange(async (value) => {
                    this.plugin.settings[targetName as keyof typeof this.plugin.settings] = value;
                    await this.plugin.saveSettings();
                }));
    }
}

