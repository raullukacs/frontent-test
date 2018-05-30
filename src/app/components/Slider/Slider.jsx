import React from 'react';
import Slide from './components/Slide';
import SliderNav from './components/SliderNav';
import CountUp from 'react-countup';

import './slider.scss';

export default class Slider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            scoreValue: 0,
            scoreDrawIndex: 1,
            creditReportInfo: {},
            slides: [
                {
                    type: 1, // with arc
                    active: true
                },
                {
                    type: 2, // only text
                    active: false
                },
                {
                    type: 2, // only text
                    active: false
                },
                {
                    type: 2, // only text
                    active: false
                },
                {
                    type: 2, // only text
                    active: false
                }
            ],
            sliderTrackStyle: {}
        };

        this.onSlideChange = this.onSlideChange.bind(this);
    }

    render() {
        let slides = [];
        this.state.slides.forEach((slide, idx) => {
            switch (slide.type) {
                case 1:
                    slides.push(<div className={"arc " + (slide.active ? "active" : "")} key={idx} style={{ width: this.props.size + 'px' }}>
                        <div>
                            <div>Your credit score is</div>
                            <div className="score">{this.state.scoreValue}</div>
                            <div>out of <span className="bold">{this.state.creditReportInfo.maxScoreValue}</span></div>
                            <div className="score-title">Soaring high </div>
                        </div>
                        <canvas ref="canvas" width={this.props.size} height={this.props.size}></canvas>
                    </div>);
                    break;
                case 2:
                    slides.push(<div key={idx} className={slide.active ? "active" : ""} style={{ width: this.props.size + 'px' }}>
                        <div>
                            <div>Your long term debt {idx} is</div>
                            <div className="score">{this.state.creditReportInfo.currentLongTermDebt}</div>
                        </div>
                    </div>);
                    break;
            }
        });

        this.state.sliderTrackStyle.width = this.props.size * this.state.slides.length;

        return (
            <div className="slider">
                <div className="slider-track" style={this.state.sliderTrackStyle}>
                    {slides}
                </div>
                <SliderNav slidesCount={this.state.slides.length} onSlideChange={this.onSlideChange}></SliderNav>
            </div>
        );
    }

    componentDidMount() {
        this.getData().then((response) => {
            this.setState({ creditReportInfo: response.creditReportInfo }, this.drawScoreArc);
        });
    }

    onSlideChange(activeSlideIdx) {
        this.setState((prevState, props) => {
            let newSlides = prevState.slides.slice(0);
            let currentSlideIdx = newSlides.findIndex(s => s.active);
            newSlides.forEach((slide) => {
                slide.active = false;
            });

            newSlides[activeSlideIdx].active = true;

            // determine slide direction
            let newTranslation = {};
            if (currentSlideIdx < activeSlideIdx) {
                // slide left
                newTranslation = (-1) * activeSlideIdx * props.size;
            }
            else {
                // slide right
                newTranslation = activeSlideIdx * props.size;
            }

            return {
                slides: newSlides,
                sliderTrackStyle: {
                    transform: "translateX(" + newTranslation + "px)"
                }
            };
        });
    }

    drawScoreArc() {
        this.endPercent = (this.state.creditReportInfo.score * 100 / this.state.creditReportInfo.maxScoreValue);
        this.curPerc = 0;

        const context = this.refs.canvas.getContext('2d');
        context.lineWidth = 3;
        context.strokeStyle = '#8dc7d6';

        this.drawArc();
    }

    drawArc(current) {
        const canvas = this.refs.canvas;
        const context = canvas.getContext('2d');

        const x = canvas.width / 2;
        const y = canvas.height / 2;
        const radius = 170;
        const circ = Math.PI * 2;
        const quart = Math.PI / 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.arc(x, y, radius, -(quart), ((circ) * current) - quart, false);
        context.stroke();

        this.curPerc++;
        if (this.curPerc < this.endPercent) {
            const requestAnimationFrame =
                window.requestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame;

            requestAnimationFrame(this.drawArc.bind(this, this.curPerc / 100));

            this.setState((prevState, props) => ({
                scoreDrawIndex: prevState.scoreDrawIndex + 1,
                scoreValue: ((prevState.scoreDrawIndex) * (prevState.creditReportInfo.maxScoreValue / 100)).toFixed(0)
            }));
        }
        else {
            this.setState({ scoreValue: this.state.creditReportInfo.score });
        }
    }

    getData() {
        return fetch('https://s3.amazonaws.com/cdn.clearscore.com/native/interview_test/creditReportInfo.json')
            .then((response) => response.json())
            .then((responseJson) => {
                return responseJson;
            })
            .catch((error) => {
                console.error(error);
            });
    }
}