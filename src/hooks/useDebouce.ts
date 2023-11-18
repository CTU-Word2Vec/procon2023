import { useEffect, useState } from 'react';

export default function useDebouce<T>(value: T, ms: number = 500) {
	const [deboucedValue, setDeboucedValue] = useState<T>(() => value);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setDeboucedValue(value);
		}, ms);

		return () => window.clearTimeout(timeout);
	}, [value, ms]);

	return deboucedValue;
}
