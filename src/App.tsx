import React, {useState} from 'react';
import './App.css';

type CourseInfo = {
    id: string,
    text: string
}

type CourseRecord = {
    A: number
    // non-essential fields excluded for brevity
}

type CourseInfoResponseData = {
    header: Array<any>,
    raw: Array<CourseRecord>
}

function App() {

    const [courses, setCourses] = useState("");
    const [info, setInfo] = useState(new Array<CourseInfo>());
    const courseRegex = /([A-Za-z]+) ?([0-9]{4})/g;

    const mean = (nums: Array<number>): number => {
        return nums.reduce((prev, curr) => prev + curr) / nums.length;
    }

    const getValidCourses = (): Array<string> => {
        let matches = [...courses.matchAll(courseRegex)];
        return matches.map(match => `${match[1].toUpperCase()} ${match[2]}`)
    }

    const getDifficultyString = async (course: string): Promise<CourseInfo> => {
        const url: string = `https://c4citk6s9k.execute-api.us-east-1.amazonaws.com/prod/data/course?courseID=${course.replace(" ", "%20")}`;
        const responseData: CourseInfoResponseData = await fetch(url).then(response => response.json());
        const averageA = mean(responseData.raw.map(r => r.A));
        if (responseData.header[0].full_name) {
            if (averageA < 30) return {id: course, text: `${course} is a difficult class.`};
            else if (averageA < 50) return {id: course, text: `${course} is a moderate class.`};
            else return {id: course, text: `${course} is an easy class.`};
        } else {
            return {id: course, text: `$Error: No data available for {course}.`};
        }
    }

    const findInfo = async () => {
        setInfo(await Promise.all(getValidCourses().map(course => getDifficultyString(course))))
    }

    return (
    <div className="App">
        <div className="container w-100">
            <div className="row mt-5 justify-content-center"><h1 className="display-4">Rate My Schedule</h1></div>
            <div className="row justify-content-center">A tool to help plan course registration at Georgia Tech</div>
            <div className="row my-5 w-100">
                <div className="col-2"></div>
                <div className="w-100 col-8">
                    <label htmlFor="courses">Enter a comma-separated list of classes:</label>
                    <input type="text" name="courses" id="courses" className="form-control"
                           placeholder="e.g. PSYC 1101, MATH 1554, CS 2050"
                           onChange={event => setCourses(event.target.value)}/><br/>
                    <div className="row">
                        <div className="col-5"></div>
                        <button onClick={findInfo} className="btn-primary col-2">Submit</button>
                        <div className="col-5"></div>
                    </div>
                </div>
                <div className="col-2"></div>
            </div>
            { info && <div className="row my-5">
                <div className="col-2"></div>
                <div className="text-info col-8">
                    { info.map(res => <p key={res.id}>{res.text}</p>) }
                </div>
                <div className="col-2"></div>
            </div> }
        </div>
    </div>
  );
}

export default App;
