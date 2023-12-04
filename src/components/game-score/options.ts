export const sideChartOptions: ApexCharts.ApexOptions = {
	stroke: {
		curve: 'smooth',
		width: 2,
	},
	grid: { show: false },
	chart: {
		toolbar: {
			show: false,
		},
		height: 100,
		zoom: { enabled: false },
		animations: {
			enabled: true,
			easing: 'easeinout',
			dynamicAnimation: {
				speed: 1000,
			},
		},
		stacked: true,
	},
	xaxis: {
		labels: {
			show: false,
		},
		axisBorder: {
			show: false,
		},
		axisTicks: {
			show: false,
		},
	},
	yaxis: {
		labels: {
			show: false,
		},
	},
	dataLabels: {
		enabled: false,
	},
	legend: {
		show: false,
	},
	subtitle: {
		text: 'Điểm',
		align: 'center',
		margin: 0,
		offsetY: 10,
		style: {
			fontSize: '14px',
			color: '#888ea8',
		},
	},
};

export const mainChartOptions: ApexCharts.ApexOptions = {
	stroke: {
		curve: 'smooth',
		width: 2,
		colors: ['#06619e', '#009c15'],
	},
	chart: {
		toolbar: {
			show: false,
		},
		height: 400,
		zoom: { enabled: false },
		animations: {
			enabled: true,
			easing: 'easeinout',
		},
	},
	xaxis: {
		labels: {
			show: false,
		},
	},
	subtitle: {
		text: 'Tổng điểm',
		align: 'center',
		margin: 0,
		offsetY: 10,
		style: {
			fontSize: '14px',
			color: '#888ea8',
		},
	},
};
