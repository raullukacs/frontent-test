import React from 'react';

export default class SliderNav extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            indicators : []
        };

        for(let i = 0; i < this.props.slidesCount; i++){
            this.state.indicators.push({
                id : i,
                active : i === 0
            });
        }

        this.handleSlideActivation = this.handleSlideActivation.bind(this);
    }

    render() {
        let indicatorsEl = [];
        this.state.indicators.forEach(ind => {
            indicatorsEl.push(<li className={ind.active ? 'active' : ''} key={ind.id} onClick={() => this.handleSlideActivation(ind)}></li>);
        });

        return (
            <ol className="indicators">
                {indicatorsEl}
            </ol>
        );
    }

    handleSlideActivation(activeIndicator){
        if(activeIndicator.active){
            return;
        }

        this.setState((prevState) => {
            let newIndicators = prevState.indicators.slice(0);
            
            newIndicators.forEach((ind, i) => {
                ind.active = false;
                if(i === activeIndicator.id){
                    activeIndicator.active = true;
                    ind = activeIndicator;
                }
            });

            return newIndicators;
        });

        this.props.onSlideChange(activeIndicator.id);
    }
}