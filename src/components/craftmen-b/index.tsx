import craftmenB from '@/assets/icons/craftsman-b.svg';

export interface CraftmenBProps {
	style?: React.HTMLAttributes<HTMLDivElement>;
}

export default function CraftmenB({ style }: CraftmenBProps) {
	return (
		<div style={{ width: 64, height: 64, ...style }}>
			<img src={craftmenB} alt='Craftmen B' style={{ width: '100%' }} />
		</div>
	);
}
