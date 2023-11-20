import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  Clipboard,
  Image,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import axios from 'axios'

export default class App extends Component {
  state = {
    image: null,
    uploading: false,
  };

  render() {
    let {
      image
    } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="default" />

        <Text
          style={styles.exampleText}>
          Example: Upload ImagePicker result
        </Text>

        <Button
          onPress={this._pickImage}
          title="Pick an image from camera roll"
        />

        <Button onPress={this._takePhoto} title="Take a photo" />

        {this._maybeRenderImage()}
        {this._maybeRenderUploadingOverlay()}
      </View>
    );
  }

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[StyleSheet.absoluteFill, styles.maybeRenderUploading]}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let {
      image
    } = this.state;

    if (!image) {
      return;
    }

    return (
      <View
        style={styles.maybeRenderContainer}>
        <View
          style={styles.maybeRenderImageContainer}>
          <Image source={{ uri: image }} style={styles.maybeRenderImage} />
        </View>

        <Text
          onPress={this._copyToClipboard}
          onLongPress={this._share}
          style={styles.maybeRenderImageText}>
          {image}
        </Text>
      </View>
    );
  };

  _share = () => {
    Share.share({
      message: this.state.image,
      title: 'Check out this photo',
      url: this.state.image,
    });
  };

  _copyToClipboard = () => {
    Clipboard.setString(this.state.image);
    alert('Copied image URL to clipboard');
  };

  _takePhoto = async () => {
  
    // only if user allows permission to camera AND camera roll

      let pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      this._handleImagePicked(pickerResult);
    
  };

  _pickImage = async () => {

    // only if user allows permission to camera roll

      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true
      });

      this._handleImagePicked(pickerResult);
    
  };

  _handleImagePicked = async pickerResult => {
    let uploadResponse, uploadResult;



    try {
      this.setState({
        uploading: true
      });

      if (!pickerResult.canceled) {
        //console.log(pickerResult);
        const response = await fetch(pickerResult.assets[0].uri);
        const blob = await response.blob();
        // console.log(blob);
        uploadResponse = await uploadImageAsync(blob);

        this.setState({
          image: uploadResponse.url
        });
      }
    } catch (e) {
      console.log({ uploadResponse });
      console.log({ e });
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({
        uploading: false
      });
    }
    console.log(uploadResponse);
  };
}

async function uploadImageAsync(image) {
  let apiUrl = 'http://localhost:3000/api/v1/image/createClientImage';



  const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjEyLCJpYXQiOjE3MDAzNjc1MTUsImV4cCI6MTcwMDcyNzUxNX0.Khvo8U7s1NqM6ILrw59ADq-0GLu_lkO0Qb3cOz6gfS8';

  let formData = new FormData();
  formData.append('name', 'myPic');
  formData.append('image', image);

  return await axios.post(apiUrl, formData, { headers: { 'Authorization': token}})
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  exampleText: {
    fontSize: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    textAlign: 'center',
  },
  maybeRenderUploading: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  maybeRenderContainer: {
    borderRadius: 3,
    elevation: 2,
    marginTop: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 4,
      width: 4,
    },
    shadowRadius: 5,
    width: 250,
  },
  maybeRenderImageContainer: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
  },
  maybeRenderImage: {
    height: 250,
    width: 250,
  },
  maybeRenderImageText: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  }
});