export default function RouteLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full h-full">
            <div className="flex flex-col items-center gap-4">
                <div className="w-[64px] h-[64px]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 200 200"
                        className="w-full h-full"
                        aria-label="Loading"
                    >
                        <rect
                            width="199"
                            height="199"
                            rx="6"
                            x="0.5"
                            y="0.5"
                            fill="transparent"
                            strokeWidth="1"
                            stroke="currentColor"
                            className="text-border opacity-20"
                        />
                        <ellipse rx="8" ry="8" fill="currentColor" className="text-primary">
                            <animateMotion
                                id="left_to_right"
                                path="M33.3333,100 L166.6666,100"
                                dur="750ms"
                                begin="0ms; right_to_left.end"
                                calcMode="spline"
                                keyPoints="0; 1"
                                keyTimes="0; 1"
                                keySplines="0.42, 0, 0.58, 1"
                            />
                            <animateMotion
                                id="right_to_left"
                                path="M166.6666,100 L33.3333,100"
                                dur="750ms"
                                begin="left_to_right.end"
                                calcMode="spline"
                                keyPoints="0; 1"
                                keyTimes="0; 1"
                                keySplines="0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="rx"
                                dur="750ms"
                                begin="left_to_right.begin; right_to_left.begin"
                                calcMode="spline"
                                values="8; 8.4; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="ry"
                                dur="750ms"
                                begin="left_to_right.begin; right_to_left.begin"
                                calcMode="spline"
                                values="8; 7.6; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                        </ellipse>
                        <ellipse fill="transparent" rx="8" ry="8" className="text-primary">
                            <animateMotion
                                id="upper_1"
                                path="M66.6666,88.8888 L66.6666,71.4285"
                                dur="300ms"
                                begin="left_to_right.begin+93.75ms; right_to_left.begin+375ms"
                                fill="freeze"
                                calcMode="spline"
                                keyPoints="0; 1; 0"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="rx"
                                dur="300ms"
                                begin="upper_1.begin"
                                calcMode="spline"
                                values="8; 8.4; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="ry"
                                dur="300ms"
                                begin="upper_1.begin"
                                calcMode="spline"
                                values="8; 7.6; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <set
                                attributeName="fill"
                                to="currentColor"
                                begin="upper_1.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse
                            fill="currentColor"
                            rx="8"
                            ry="8"
                            cx="66.6666"
                            cy="88.8888"
                            className="text-primary"
                        >
                            <set
                                attributeName="fill"
                                to="transparent"
                                begin="upper_1.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse fill="transparent" rx="8" ry="8" className="text-primary">
                            <animateMotion
                                id="lower_1"
                                path="M66.6666,111.1111 L66.6666,128.5714"
                                dur="300ms"
                                begin="left_to_right.begin+93.75ms; right_to_left.begin+375ms"
                                fill="freeze"
                                calcMode="spline"
                                keyPoints="0; 1; 0"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="rx"
                                dur="300ms"
                                begin="lower_1.begin"
                                calcMode="spline"
                                values="8; 8.4; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="ry"
                                dur="300ms"
                                begin="lower_1.begin"
                                calcMode="spline"
                                values="8; 7.6; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <set
                                attributeName="fill"
                                to="currentColor"
                                begin="lower_1.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse
                            fill="currentColor"
                            rx="8"
                            ry="8"
                            cx="66.6666"
                            cy="111.1111"
                            className="text-primary"
                        >
                            <set
                                attributeName="fill"
                                to="transparent"
                                begin="lower_1.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse fill="transparent" rx="8" ry="8" className="text-primary">
                            <animateMotion
                                id="upper_2"
                                path="M88.8888,88.8888 L88.8888,71.4285"
                                dur="300ms"
                                begin="left_to_right.begin+187.5ms; right_to_left.begin+281.25ms"
                                fill="freeze"
                                calcMode="spline"
                                keyPoints="0; 1; 0"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="rx"
                                dur="300ms"
                                begin="upper_2.begin"
                                calcMode="spline"
                                values="8; 8.4; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="ry"
                                dur="300ms"
                                begin="upper_2.begin"
                                calcMode="spline"
                                values="8; 7.6; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <set
                                attributeName="fill"
                                to="currentColor"
                                begin="upper_2.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse
                            fill="currentColor"
                            rx="8"
                            ry="8"
                            cx="88.8888"
                            cy="88.8888"
                            className="text-primary"
                        >
                            <set
                                attributeName="fill"
                                to="transparent"
                                begin="upper_2.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse fill="transparent" rx="8" ry="8" className="text-primary">
                            <animateMotion
                                id="lower_2"
                                path="M88.8888,111.1111 L88.8888,128.5714"
                                dur="300ms"
                                begin="left_to_right.begin+187.5ms; right_to_left.begin+281.25ms"
                                fill="freeze"
                                calcMode="spline"
                                keyPoints="0; 1; 0"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="rx"
                                dur="300ms"
                                begin="lower_2.begin"
                                calcMode="spline"
                                values="8; 8.4; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="ry"
                                dur="300ms"
                                begin="lower_2.begin"
                                calcMode="spline"
                                values="8; 7.6; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <set
                                attributeName="fill"
                                to="currentColor"
                                begin="lower_2.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse
                            fill="currentColor"
                            rx="8"
                            ry="8"
                            cx="88.8888"
                            cy="111.1111"
                            className="text-primary"
                        >
                            <set
                                attributeName="fill"
                                to="transparent"
                                begin="lower_2.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse fill="transparent" rx="8" ry="8" className="text-primary">
                            <animateMotion
                                id="upper_3"
                                path="M111.1111,88.8888 L111.1111,71.4285"
                                dur="300ms"
                                begin="left_to_right.begin+281.25ms; right_to_left.begin+187.5ms"
                                fill="freeze"
                                calcMode="spline"
                                keyPoints="0; 1; 0"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="rx"
                                dur="300ms"
                                begin="upper_3.begin"
                                calcMode="spline"
                                values="8; 8.4; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="ry"
                                dur="300ms"
                                begin="upper_3.begin"
                                calcMode="spline"
                                values="8; 7.6; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <set
                                attributeName="fill"
                                to="currentColor"
                                begin="upper_3.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse
                            fill="currentColor"
                            rx="8"
                            ry="8"
                            cx="111.1111"
                            cy="88.8888"
                            className="text-primary"
                        >
                            <set
                                attributeName="fill"
                                to="transparent"
                                begin="upper_3.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse fill="transparent" rx="8" ry="8" className="text-primary">
                            <animateMotion
                                id="lower_3"
                                path="M111.1111,111.1111 L111.1111,128.5714"
                                dur="300ms"
                                begin="left_to_right.begin+281.25ms; right_to_left.begin+187.5ms"
                                fill="freeze"
                                calcMode="spline"
                                keyPoints="0; 1; 0"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="rx"
                                dur="300ms"
                                begin="lower_3.begin"
                                calcMode="spline"
                                values="8; 8.4; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="ry"
                                dur="300ms"
                                begin="lower_3.begin"
                                calcMode="spline"
                                values="8; 7.6; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <set
                                attributeName="fill"
                                to="currentColor"
                                begin="lower_3.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse
                            fill="currentColor"
                            rx="8"
                            ry="8"
                            cx="111.1111"
                            cy="111.1111"
                            className="text-primary"
                        >
                            <set
                                attributeName="fill"
                                to="transparent"
                                begin="lower_3.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse fill="transparent" rx="8" ry="8" className="text-primary">
                            <animateMotion
                                id="upper_4"
                                path="M133.3333,88.8888 L133.3333,71.4285"
                                dur="300ms"
                                begin="left_to_right.begin+375ms; right_to_left.begin+93.75ms"
                                fill="freeze"
                                calcMode="spline"
                                keyPoints="0; 1; 0"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="rx"
                                dur="300ms"
                                begin="upper_4.begin"
                                calcMode="spline"
                                values="8; 8.4; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="ry"
                                dur="300ms"
                                begin="upper_4.begin"
                                calcMode="spline"
                                values="8; 7.6; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <set
                                attributeName="fill"
                                to="currentColor"
                                begin="upper_4.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse
                            fill="currentColor"
                            rx="8"
                            ry="8"
                            cx="133.3333"
                            cy="88.8888"
                            className="text-primary"
                        >
                            <set
                                attributeName="fill"
                                to="transparent"
                                begin="upper_4.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse fill="transparent" rx="8" ry="8" className="text-primary">
                            <animateMotion
                                id="lower_4"
                                path="M133.3333,111.1111 L133.3333,128.5714"
                                dur="300ms"
                                begin="left_to_right.begin+375ms; right_to_left.begin+93.75ms"
                                fill="freeze"
                                calcMode="spline"
                                keyPoints="0; 1; 0"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="rx"
                                dur="300ms"
                                begin="lower_4.begin"
                                calcMode="spline"
                                values="8; 8.4; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <animate
                                attributeName="ry"
                                dur="300ms"
                                begin="lower_4.begin"
                                calcMode="spline"
                                values="8; 7.6; 8"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.42, 0, 0.58, 1; 0.42, 0, 0.58, 1"
                            />
                            <set
                                attributeName="fill"
                                to="currentColor"
                                begin="lower_4.begin"
                                fill="freeze"
                            />
                        </ellipse>
                        <ellipse
                            fill="currentColor"
                            rx="8"
                            ry="8"
                            cx="133.3333"
                            cy="111.1111"
                            className="text-primary"
                        >
                            <set
                                attributeName="fill"
                                to="transparent"
                                begin="lower_4.begin"
                                fill="freeze"
                            />
                        </ellipse>
                    </svg>
                </div>
            </div>
        </div>
    )
}

