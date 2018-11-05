import React, { Component } from 'react';
import Navagation from './Components/Navagation/Navagation'
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register'
import Particles from 'react-particles-js'
import './App.css';
import Clarifai from 'clarifai'
import app from './clarifaiApp';


const particlesOptions = {
  particles: {
    number:{
      value: 60,
      density:{
        enable:true,
        value_area: 800,
      }
    }
  }
}

class App extends Component {
    constructor(){
      super();
      this.state = {
        input: "https://samples.clarifai.com/face-det.jpg",
        imageUrl: "",
        box: {},
        route: 'signin',
        isSignedIn: false,
        user: {
          id: '',
          name: '',
          email: '',
          entries: 0,
          joined: ''
        }
      }
    }


    calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('input-image');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - clarifaiFace.right_col * width,
        bottomRow: height - clarifaiFace.bottom_row * height
      }

    }
    dislplayFaceBox = (box) => {
      this.setState({box})
    }
    onInputChange = (e) =>{
      this.setState({input: e.target.value})
    }
    onSubmit = () =>{
      this.setState({
        imageUrl: this.state.input
      });
      app.models
         .predict(
            Clarifai.FACE_DETECT_MODEL,
            this.state.input)
         .then(res => {
           if(res){
             fetch('http://localhost:4000/image',{
               method: 'put',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({
                 id: this.state.user.id
               })
             })
                .then(response => response.json())
                .then(count => {
                  console.log(count);
                  this.setState(Object.assign(this.state.user, {entries: count}));
                })
           }
           this.dislplayFaceBox(this.calculateFaceLocation(res));
         })
         .catch(err => {
           console.log(err);
         })

    }
    onRouteChange = (route) =>{
      if (route === 'signout'){
        this.setState({
          isSignedIn: false,
        })
      } else if (route === 'home'){
        this.setState({
          isSignedIn: true,
        })
      }
      this.setState({
        route: route,

      })
    }
    loadUser = (userData) =>{
      this.setState({user:{
        id: userData.id,
        name: userData.name,
        email: userData.email,
        entries: userData.entries,
        joined: userData.joined
      }})
    }

  render() {
    return (
      <div className="App">
        <Particles className="particles"
          params={particlesOptions}
        />
        <Navagation
          onRouteChange={this.onRouteChange}
          isSignedIn={this.state.isSignedIn}
        />
        { this.state.route === 'home' ?
        <div>
          <Logo />
          <Rank
            name={this.state.user.name}
            entries={this.state.user.entries}
          />
          <ImageLinkForm
            onInputChange={this.onInputChange}
            onSubmit={this.onSubmit}
          />
          <FaceRecognition image={this.state.imageUrl} box={this.state.box}/>
        </div> :
        (
          this.state.route ==="signin" ?
          <Signin
            onRouteChange={this.onRouteChange}
            loadUser={this.loadUser} /> :
          <Register
            onRouteChange={this.onRouteChange}
            loadUser={this.loadUser}/>
        )


      }
      </div>
    );
  }
}

export default App;
