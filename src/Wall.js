import './wall.less';
import React, {PropTypes as T} from 'react';
import * as Split from './RectangleSplit';

export default class Wall2 extends React.Component {
    static defaultProps = {
        debug: true
    }

    constructor(props) {
        super(props);
        if(this.props.debug) console.log("Wall - Construct");
        var { targets } = this.props;
                
        this.state = {
            targets: targets,
            wallRects: [],
            targetRects: [],
            screenRects: [],
            observer: null
        };
    }

    componentDidMount = () => {
        if(this.props.debug) console.log("Wall - componentDidMount");

        var observer = new MutationObserver((mutations) => {
            this.prepareWall();
        });

        observer.observe(document.body, { attributes: true, childList: true, subtree: true, characterData: true });
        this.setState({ observer });

        this.prepareWall();
        document.addEventListener("scroll", this.handlePageScroll);
    }

    componentWillUnmount = () => {
        if(this.props.debug) console.log("Wall - componentWillUnmount");
        document.removeEventListener("scroll", this.handlePageScroll);
        
        var { observer } = this.state;
        if(observer) {
            observer.disconnect();
        }

        this.setState({ wallRects: null, observer: null });
    }

    componentWillReceiveProps = (nextProps) => {
        if(this.props.debug) console.log("Wall - componentWillReceiveProps", nextProps);
        this.prepareWall();
    }

    handlePageScroll = (e) => {
        this.prepareWall();
    }
    
    prepareWall = () => {
        if(this.props.debug) console.log("Wall - PrepareWall");
        var { targets } = this.state;
        var targetElems = this.getTargetElements(targets);
        var targetRects = this.makeTargetRects(targetElems);
        var screenRects = targetRects.filter((targetRect) => targetRect.isScreen);
        var wallRects = this.makeTargetHoles(targetRects);
        this.setState({ wallRects, targetRects, screenRects });
    }

    getTargetElements = (targets) => {
        var targetElements = targets.map((target) => {
            let selector = typeof target.target !== 'undefined' ? target.target : target;
            let container = typeof target.container !== 'undefined' ? document.querySelector(target.container) : document;
            let isScreen = typeof target.screen !== 'undefined' ? target.screen : false;
            let element = null;

            // Detect iframe containers
            if(typeof container.contentWindow !== 'undefined') {
                element = container.contentWindow.document.querySelector(selector);
            } else {
                element = container.querySelector(selector);
            }

            return { selector, container, element, isScreen };
        });

        return targetElements.filter((target) => target && target.element != null);
    }

    makeTargetRects = (targetElements) => {
        if(targetElements) {
            var xOffset = window.scrollX;
            var yOffset = window.scrollY;

            return targetElements.map((targetInfo) => {
                var rect = targetInfo.element.getBoundingClientRect();
                var containerXOffset = 0;
                var containerYOffset = 0;

                // Since we are looking inside a nested container, we need to add the containers left / top positions to the rectangles final position relative to the parent document
                if(targetInfo.container != document) {
                    var containerRect = targetInfo.container.getBoundingClientRect();
                    containerXOffset = containerRect.left;
                    containerYOffset = containerRect.top;
                }

                // If the element is fixed then we gotta do something nifty with the positioning
                // return null;
                return { ...targetInfo, x1: rect.left + xOffset + containerXOffset, x2: rect.left + rect.width + xOffset + containerXOffset, y1: rect.top + yOffset + containerYOffset, y2: rect.top + rect.height + yOffset + containerYOffset };
            });
        }

        return [];
    }

    makeTargetHoles = (targetRects) => {
        // Get base rectangle from document dimensions
        var width = document.body.scrollWidth;
        var height = document.body.scrollHeight;
        var base = { x1: 0, x2: width, y1: 0, y2: height };

        return Split.collide(targetRects, base);
    }

    render() {
        if(this.props.debug) console.log("Wall - Render");
        var { wallRects, targetRects, screenRects } = this.state;

        return (
            <div>
                { wallRects && wallRects.length > 0 && 
                    wallRects.map((rect, i) => {
                        var dimensions = {
                            top: rect.y1,
                            height: rect.y2 - rect.y1,
                            left: rect.x1,
                            width: rect.x2 - rect.x1
                        };

                        return <div key={`wall-${i}`} className="wall-segment" style={dimensions}></div>;
                    })
                }

                { screenRects && screenRects.length > 0 && 
                    screenRects.map((rect, i) => {
                        var dimensions = {
                            top: rect.y1,
                            height: rect.y2 - rect.y1,
                            left: rect.x1,
                            width: rect.x2 - rect.x1
                        };
                        return <div key={`screen-${i}`} className="wall-screen-segment" style={dimensions}></div>;
                    })
                }
            </div>
        );
    }
}
