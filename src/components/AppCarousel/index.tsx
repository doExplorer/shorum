import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Carousel } from 'antd';

import './style.less';

function getActualSlidesToShow({ slidesToShow, children }: { slidesToShow: number; children: React.ReactElement[] }) {
    let actualSlidesToShow = slidesToShow;
    if (actualSlidesToShow > children.length) {
        actualSlidesToShow = children.length;
    }
    return actualSlidesToShow;
}

function getMaxWidth({ slidesToShow, children }: { slidesToShow: number; children: React.ReactElement[] }) {
    if (!children || !children.length) {
        return 0;
    }

    const actualSlidesToShow = getActualSlidesToShow({ slidesToShow, children });

    const maxSlideWidth = Math.floor(window.innerWidth / slidesToShow);
    if (maxSlideWidth && maxSlideWidth > 0 && actualSlidesToShow && actualSlidesToShow > 0) {
        return maxSlideWidth * actualSlidesToShow;
    }
    return 0;
}

const AppCarousel = observer(function ({
    slidesToShow,
    children,
    className,
}: {
    slidesToShow: number;
    children: React.ReactElement[];
    className?: string;
}) {
    const [maxWidth, setMaxWidth] = useState(getMaxWidth({ slidesToShow, children }));
    useEffect(() => {
        function listenWindowResize() {
            const currentMaxWidth = getMaxWidth({ slidesToShow, children });
            setMaxWidth(currentMaxWidth);
        }
        listenWindowResize();
        window.addEventListener('resize', listenWindowResize);
        return () => {
            window.removeEventListener('resize', listenWindowResize);
        };
    }, [slidesToShow, children]);

    if (!children || !children.length) {
        return null;
    }

    const actualSlidesToShow = getActualSlidesToShow({ slidesToShow, children });

    let style: React.CSSProperties | undefined;
    if (maxWidth && maxWidth > 0) {
        style = {
            maxWidth,
        };
    }

    return (
        <div className={classNames('app-carousel', className)}>
            <div style={style}>
                <Carousel slidesToShow={actualSlidesToShow} slidesToScroll={1} lazyLoad="ondemand" autoplay infinite>
                    {children}
                </Carousel>
            </div>
        </div>
    );
});

export default AppCarousel;
