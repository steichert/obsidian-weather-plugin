export class FeedbackResponse {
    data: FeedbackData;

    constructor(data: FeedbackData) { 
        this.data = data;
    }
}

export class FeedbackData {
    timelines: Array<FeedbackTimeline>;

    constructor(timelines: Array<FeedbackTimeline>) {
        this.timelines = timelines
    }
}

export class FeedbackTimeline {
    timestep: string;
    startTime: string;
    endTime: string;
    intervals: Array<FeedbackInterval>

    constructor(timestep: string, startTime: string, endTime: string, intervals: Array<FeedbackInterval>) {
        this.timestep = timestep;
        this.startTime = startTime;
        this.endTime = endTime;
        this.intervals = intervals;
    }
}

export class FeedbackInterval {
    startTime: string;
    values: FeedbackValues;

    constructor(startTime: string, values: FeedbackValues) {
        this.startTime = startTime;
        this.values = values;
    }
}

export class FeedbackValues {
    cloudBase: number;
    cloudCeiling: number;
    cloudCover: number;
    precipitationIntensity: number;
    precipitationType: number;
    temperature: number;
    temperatureApparent: number;
    weatherCode: number;
    windDirection: number;
    windGust: number;
    windSpeed: number;
}