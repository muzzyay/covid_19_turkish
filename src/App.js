import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InfoBox} from "./components/ui";


import countries from "./constants/countries";

import {groupBy} from "lodash";

import {Container, Row, Col, Dropdown, Jumbotron} from 'react-bootstrap';

class App extends Component {
  state = {
    selected:null,
    selectedRegion: null,
    world:null,
    stats: null,
    filterValue: '',
    filterRegion:'',
    regions: {},
    ctCodes: null,
    all_data: null
  }

  componentWillMount(){
    this.getWorldData();
  }

  getWorldData = async ()=>{
    try{

      // const url = `https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Z7biAeD8PAkqgmWhxG2A/FeatureServer/1/query?f=json&where=(Confirmed > 0) AND (Deaths>0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Deaths desc,Country_Region asc,Province_State asc&outSR=102100&resultOffset=0&resultRecordCount=250&cacheHint=true`

      // const copy = `https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Z7biAeD8PAkqgmWhxG2A/FeatureServer/1/query?f=json&where=(Confirmed > 0) AND (Deaths>0) AND (Country_Region='China')&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Deaths desc,Country_Region asc,Province_State asc&outSR=102100&resultOffset=0&resultRecordCount=250&cacheHint=true`

      const URL ="https://covid19.mathdro.id/api/confirmed"

      const response = await fetch(URL);
      const data = await response.json();
      
      const countriesGrupedByiso = groupBy(data, 'iso2');
      let all_data = {};

      Object.entries(countriesGrupedByiso).forEach(([code, data])=>{
        console.log(code, data)
        let country = data[0].countryRegion;
        let confirmed = data.map(dt=>dt.confirmed).reduce((a,c)=>a+c,0);
        let recovered = data.map(dt=>dt.recovered).reduce((a,c)=>a+c,0); 
        let deaths = data.map(dt=>dt.deaths).reduce((a,c)=>a+c,0);
        let active = data.map(dt=>dt.active).reduce((a,c)=>a+c,0);
        let lastUpdate = data.map(dt=>dt.lastUpdate).sort((a,b)=>b-a)[0];
        let regions = data.filter(dt=>dt.provinceState).length ? data.filter(dt=>dt.provinceState) : null;

        all_data[code] = {
          country,
          confirmed,
          recovered,
          deaths,
          active,
          lastUpdate,
          regions
        }
      })

      let stats = {
        confirmed: Object.values(all_data).map(dt=>dt.confirmed).reduce((a,c)=>a+c,0),
        recovered: Object.values(all_data).map(dt=>dt.recovered).reduce((a,c)=>a+c,0),
        deaths: Object.values(all_data).map(dt=>dt.deaths).reduce((a,c)=>a+c,0),
        active: Object.values(all_data).map(dt=>dt.active).reduce((a,c)=>a+c,0),
        last_update: new Date(Object.values(all_data).map(dt=>dt.lastUpdate).sort((a,b)=>b-a)[0])
      }



      this.setState({ctCodes: Object.keys(countriesGrupedByiso), all_data, stats});
      // console.log(countriesGrupedByiso, "COVID")
      // console.log(data.map(dt=>dt.deaths).reduce((a,c)=>a+c, 0), 'COVID')

    }catch(err){
      console.log(err, "COVID ERR");
      let payload = {
        confirmed: 0,
        recovered: 0,
        active: 0,
        deaths: 0
      }
      this.setState({stats: payload})
    }

   

    // try{
    //   const response = await fetch("https://covid19.mathdro.id/api");
    //   const data = await response.json();
    //   let payload = {
    //     confirmed: data.confirmed.value,
    //     recovered: data.recovered.value,
    //     deaths: data.deaths.value,
    //     last_update: new Date(data.lastUpdate)
    //   }
    //   this.setState({stats: payload})
    // }catch(err){
    //   let payload = {
    //     confirmed: 0,
    //     recovered: 0,
    //     deaths: 0
    //   }
    //   this.setState({stats: payload})
    // }
    
  }

  _handleSelectRegion = region=>{
    const {confirmed, deaths, recovered, active, lastUpdate} = this.state.regions[region];

    let stats = {
      confirmed,
      recovered,
      deaths,
      active,
      last_update: new Date(lastUpdate)
    }

    this.setState({selectedRegion: region, stats});
  }

  _handleSelect = async country =>{
    this.setState({selected: country, selectedRegion: null, regions: {}});
    if (!country) return this.getWorldData();

    
    // let theCountry = codes[countries[country]];

    try{
      // const response = await fetch("https://covid19.mathdro.id/api/countries/"+theCountry);
      // const data = await response.json();

      // const res = await fetch("https://covid19.mathdro.id/api/countries/"+theCountry+"/confirmed");
      // const regionData = await res.json();
      const data = this.state.all_data[countries[country]];
      const regionData = data.regions;

      let regions = {};

      regionData&&regionData.filter(reg=>reg.provinceState).forEach(region=>regions[region.provinceState]=region);

      let payload = {
        confirmed: data.confirmed,
        recovered: data.recovered,
        deaths: data.deaths,
        active: data.active,
        last_update: new Date(data.lastUpdate)
      }
  
      this.setState({stats: payload, regions})
    }catch(err){
      let payload = {
        confirmed: 0,
        recovered: 0,
        deaths: 0,
        active: 0,
        last_update: new Date()
      }
      this.setState({stats: payload})
    }
    

  }


  
  render (){
    const {selected, selectedRegion, stats, filterValue, filterRegion, regions, ctCodes} = this.state;

    if (!stats || !ctCodes) return null;

    const countriesWithData = Object.entries(countries).filter(([name, code])=>ctCodes.includes(code))

    let filteredCountries = (filterValue && countriesWithData.filter(([name, code])=> name.toLowerCase().includes(filterValue.toLowerCase()) || name.toLowerCase().includes(filterValue.toLowerCase()))) || countriesWithData;


    let filteredRegions = (filterRegion && Object.keys(regions).filter(region=>region.toLowerCase().includes(filterRegion.toLowerCase()))) || Object.keys(regions);


    return (
      <>
      
      <Container className="mb-5">

      <Jumbotron  className="text-center text-white jumbo">
      <h1>RAKAMLARLA</h1>
        <h1>KOVID-19</h1>
        <h2>(Korona Virüs)</h2>
        
      </Jumbotron>
        
        
        <Row className="justify-content-center  ">
          <Col md={3} className="justify-content-center align-items-center text-center mb-2">
          <Dropdown>
          <Dropdown.Toggle variant="info">
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
          <Dropdown.Toggle variant="info" >
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
                filteredRegions.sort().map((region, index)=> (
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
          <Col className="mt-4 text-center text-white">
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
            <p className="text-center text-white">{`Son Güncelleme : ${formatDate(stats.last_update)}`}</p>
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
