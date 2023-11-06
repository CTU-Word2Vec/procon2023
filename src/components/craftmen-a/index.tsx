import craftmenA from '@/assets/icons/craftsman-a.svg';

export interface CraftmenAProps {
	style?: React.HTMLAttributes<HTMLDivElement>;
}

export default function CraftmenA({ style }: CraftmenAProps) {
	return (
		<div style={{ width: 64, height: 64, ...style }}>
			<img src={craftmenA} alt='Craftmen A' style={{ width: '100%' }} />
		</div>
	);
}
