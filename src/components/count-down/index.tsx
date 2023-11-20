import { Progress } from 'antd';
import { useEffect, useState } from 'react';

export interface CountDownProps {
	seconds?: number;
}

const conicColors = { '0%': '#87d068', '50%': '#ffe58f', '100%': '#87d068' };

export default function CountDown({ seconds = 5 }: CountDownProps) {
	const [count, setCount] = useState(0);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setCount((prev) => {
				if (prev === seconds) return 0;
				return prev + 1;
			});
		}, 1000);

		return () => window.clearTimeout(timeout);
	}, [count, seconds]);

	return (
		<Progress
			type='circle'
			percent={(count / seconds) * 100}
			size='small'
			strokeColor={conicColors}
			format={(number) => `${((number! * seconds) / 100).toFixed(0)}s`}
		/>
	);
}
