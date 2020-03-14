import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InfoBox} from "./components/ui";


import countries from "./constants/tr_countries"

import {Container, Row, Col, Dropdown, Jumbotron} from 'react-bootstrap';

class App extends Component {
  state = {
    selected:null,
    selectedRegion: null,
    world:null,
    stats: null,
    filterValue: '',
    filterRegion:'',
    regions: {}
  }

  componentWillMount(){
    this.getWorldData();
  }

  getWorldData = async ()=>{

    // try{

    //   const url = `https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Z7biAeD8PAkqgmWhxG2A/FeatureServer/1/query?f=json&where=(Confirmed > 0) AND (Deaths>0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Deaths desc,Country_Region asc,Province_State asc&outSR=102100&resultOffset=0&resultRecordCount=250&cacheHint=true`

    //   const copy = `https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Z7biAeD8PAkqgmWhxG2A/FeatureServer/1/query?f=json&where=(Confirmed > 0) AND (Deaths>0) AND (Country_Region='China')&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Deaths desc,Country_Region asc,Province_State asc&outSR=102100&resultOffset=0&resultRecordCount=250&cacheHint=true`

    //   const response = await fetch(url);
    //   const data = await response.json();
    //   console.log(data, 'COVID')

    // }catch(err){
    //   console.log(err, "COVID ERR")
    // }

    try{
      const response = await fetch("https://covid19.mathdro.id/api");
      const data = await response.json();
      let payload = {
        confirmed: data.confirmed.value,
        recovered: data.recovered.value,
        deaths: data.deaths.value,
        last_update: new Date(data.lastUpdate)
      }
      this.setState({stats: payload})
    }catch(err){
      let payload = {
        confirmed: 0,
        recovered: 0,
        deaths: 0
      }
      this.setState({stats: payload})
    }
    
  }

  _handleSelectRegion = region=>{
    const {confirmed, deaths, recovered, lastUpdate} = this.state.regions[region];

    let stats = {
      confirmed,
      recovered,
      deaths,
      last_update: new Date(lastUpdate)
    }

    this.setState({selectedRegion: region, stats});
  }

  _handleSelect = async country =>{
    this.setState({selected: country, selectedRegion: null, regions: {}});
    if (!country) return this.getWorldData();

    try{
      const response = await fetch("https://covid19.mathdro.id/api/countries/"+countries[country]);
      const data = await response.json();

      const res = await fetch("https://covid19.mathdro.id/api/countries/"+countries[country]+"/confirmed");
      const regionData = await res.json();

      let regions = {};

      regionData&&regionData.filter(reg=>reg.provinceState).forEach(region=>regions[region.provinceState]=region);

      let payload = {
        confirmed: data.confirmed.value,
        recovered: data.recovered.value,
        deaths: data.deaths.value,
        last_update: new Date(data.lastUpdate)
      }
  
      this.setState({stats: payload, regions})
    }catch(err){
      let payload = {
        confirmed: 0,
        recovered: 0,
        deaths: 0,
        last_update: new Date()
      }
      this.setState({stats: payload})
    }
    

  }


  
  render (){
    const {selected, selectedRegion, stats, filterValue, filterRegion, regions} = this.state;


    if (!stats) return null;

    let filteredCountries = (filterValue && Object.entries(countries).filter(([name, code])=> name.toLowerCase().includes(filterValue.toLowerCase()) || name.toLowerCase().includes(filterValue.toLowerCase()))) || Object.entries(countries);

    let filteredRegions = (filterRegion && Object.keys(regions).filter(region=>region.toLowerCase().includes(filterRegion.toLowerCase()))) || Object.keys(regions);


    return (
      <>
      <Jumbotron fluid className="text-center">
      <h1>RAKAMLARLA</h1>
        <h1>KOVID-19</h1>
        <h2>(Korona Virüs)</h2>
      </Jumbotron>
      <Container className="mb-5">
        
        
        <Row className="justify-content-center  mt-2">
          <Col md={3} className="justify-content-center align-items-center text-center mb-2">
          <Dropdown>
          <Dropdown.Toggle variant="info" id="dropdown-basic">
            {selected ? selected :'BİR ÜLKE SEÇİN'}
          </Dropdown.Toggle>

          <Dropdown.Menu
          style={{maxHeight: "50vh", overflow: "auto"}}
          >
            
            <input 
            type="text" 
            placeholder="Arama..." 
            style={{border:'1px solid gray', borderRadius:"4px", padding: '3px 3px', marginLeft: '20px'}}
            onChange={e=>this.setState({filterValue: e.target.value})}
            value={filterValue}
            />

            <Dropdown.Divider/>
            
          {
            !filterValue || "the world".includes(filterValue.toLowerCase())
            ?
            <Dropdown.Item
                    key={'world'}
                   eventKey={'world'} 
                   onSelect={(country)=>this._handleSelect(null)}
                   active={!selected}
                   >DÜNYA</Dropdown.Item>
            :
            null
          }
          {
                filteredCountries.map(([country, code], index)=> (
                  <Dropdown.Item
                  key={index}
                   eventKey={country} 
                   onSelect={(country)=>this._handleSelect(country)}
                   active={selected===country}
                   >{country}</Dropdown.Item>
                ))
              }
          </Dropdown.Menu>
        </Dropdown>

          </Col>
          {
            Object.keys(regions).length
            ?
            <Col md={3} className="justify-content-center align-items-center text-center">
          <Dropdown>
          <Dropdown.Toggle variant="info" id="dropdown-basic">
            {selectedRegion ? selectedRegion : 'BÖLGE SEÇİN'}
          </Dropdown.Toggle>

          <Dropdown.Menu
          style={{maxHeight: "50vh", overflow: "auto"}}
          >
            
            <input 
            type="text" 
            placeholder="Arama..." 
            style={{border:'1px solid gray', borderRadius:"4px", padding: '3px 3px', marginLeft: '20px'}}
            onChange={e=>this.setState({filterRegion: e.target.value})}
            value={filterRegion}
            />

            <Dropdown.Divider/>
          {
                filteredRegions.map((region, index)=> (
                  <Dropdown.Item
                  key={index}
                   eventKey={region} 
                   onSelect={(region)=>this._handleSelectRegion(region)}
                   active={selectedRegion===region}
                   >{region}</Dropdown.Item>
                ))
              }
          </Dropdown.Menu>
        </Dropdown>

          </Col>
            :
            null
          }
        </Row>
        <Row>
          <Col className="mt-4 text-center">
          <h4>{`${selectedRegion ? selectedRegion+",": ''} ${selected || 'DÜNYA'}`}</h4>
          </Col>
        </Row>
        <Row className="justify-content-between">
          
          <InfoBox
          bg='warning'
          
          title="TANI KONULAN"
          number={stats.confirmed}
          />
           <InfoBox
          bg='success'
          
          title="İYİLEŞEN"
          number={stats.recovered}
          rate={stats.confirmed>0 ? (stats.recovered/stats.confirmed) : 0}
          />
           <InfoBox
          bg='danger'
          
          title="ÖLEN"
          number={stats.deaths}
          rate={stats.confirmed>0 ? (stats.deaths/stats.confirmed) : 0}
          />
          
          
        </Row>
            <p className="text-center">{`Son Güncelleme : ${formatDate(stats.last_update)}`}</p>
      </Container>
      <footer className="container-fluid">
        <nav className="navbar fixed-bottom footer-style justify-content-center">
          {` Mustafa Ay  @2020 `}
        </nav>
      </footer>
      </>
    );
  }
  
}

export default App;

function formatDate(date){
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  return date.toLocaleTimeString('tr-TR', options);
}
