import React from 'react';
import { AppRegistry, StyleSheet, Dimensions, Image, View, StatusBar, TouchableOpacity, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Polyline from '@mapbox/polyline';

const styles = StyleSheet.create({
	map: {
		...StyleSheet.absoluteFillObject
	},
	radius: {
		height: 50,
		width: 50,
		borderRadius: 50 / 2,
		overflow: 'hidden',
		backgroundColor: 'rgba(250, 0, 0, 0.1)',
		// borderWidth: 1,
		// borderColor: 'rgba(0, 122, 255, 0.3)',
		alignItems: 'center',
		justifyContent: 'center'
	},
	marker: {
		height: 20,
		width: 20,
		borderWidth: 3,
		borderColor: 'white',
		borderRadius: 20 / 2,
		overflow: 'hidden',
		backgroundColor: 'red'
	}
});

export class Map extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			markers: [],
			latitude: null,
			longitude: null,
			concat: null,
			error: null,
			coords: [],
			x: 'false',
			cordLatitude: '40.74992696594516',
			cordLongitude: '-74.00312908000686'
		};
		this.mergeLot = this.mergeLot.bind(this);
	}

	componentDidMount() {
		this.fetchMarkerData();
		navigator.geolocation.getCurrentPosition(
			(position) => {
				console.log(position);
				this.setState({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					error: null
				});
				this.mergeLot();
			},
			(error) => this.setState({ error: error.message }),
			{ enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
		);
	}

	fetchMarkerData = () => {
		fetch('https://feeds.citibikenyc.com/stations/stations.json')
			.then((response) => response.json())
			.then((responseJson) => {
				this.setState({
					isLoading: false,
					markers: responseJson.stationBeanList
				});
			})
			.catch((error) => {
				console.log(error);
			});
	};

	mergeLot() {
		if (this.state.latitude != null && this.state.longitude != null) {
			let concatLot = this.state.latitude + ',' + this.state.longitude;
			this.setState(
				{
					concat: concatLot
				},
				() => {
					this.getDirections(concatLot, '40.74992696594516,-74.00312908000686');
				}
			);
		}
	}

	async getDirections(startLoc, destinationLoc) {
		try {
			let resp = await fetch(
				`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}`
			);
			let respJson = await resp.json();
			console.log('ROUTE', respJson.routes);
			let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
			let coords = points.map((point, index) => {
				return {
					latitude: point[0],
					longitude: point[1]
				};
			});
			this.setState({ coords: coords });
			return coords;
		} catch (error) {
			alert(error);
			return error;
		}
	}

	render() {
		return (
			<MapView
				style={styles.map}
				provider={PROVIDER_GOOGLE}
				region={{
					latitude: 40.7128,
					longitude: -74.006,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421
				}}
				showsUserLocation={true}
			>
				{this.state.isLoading ? null : (
					this.state.markers.map((marker, index) => {
						const coords = {
							latitude: marker.latitude,
							longitude: marker.longitude
						};

						const metadata = `Status: ${marker.statusValue}`;

						return (
							// <Text>Put in your address: </Text>
							<MapView.Marker
								key={index}
								coordinate={coords}
								title={marker.stationName}
								description={metadata}
							>
								<View style={styles.radius}>
									<View stle={styles.marker} />
								</View>
							</MapView.Marker>
						);
					})
				)}
				<MapView.Polyline coordinates={this.state.coords} strokeWidth={2} strokeColor="blue" />
				{!!this.state.latitude &&
				!!this.state.longitude &&
				this.state.x == 'error' && (
					<MapView.Polyline
						coordinates={[
							{ latitude: this.state.latitude, longitude: this.state.longitude },
							{ latitude: this.state.cordLatitude, longitude: this.state.cordLongitude }
						]}
						strokeWidth={2}
						strokeColor="blue"
					/>
				)}
			</MapView>
		);
	}
}
