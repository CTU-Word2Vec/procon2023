import conicColors from '@/constants/conicColors';
import { Progress } from 'antd';
import { useEffect, useState } from 'react';

export interface CountDownProps {
	seconds?: number;
}

export default function CountDown({ seconds = 5 }: CountDownProps) {
	const [count, setCount] = useState(() => seconds);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setCount((prev) => {
				if (prev === 0) return seconds;
				return prev - 1;
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
