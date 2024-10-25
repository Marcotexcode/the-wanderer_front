import React, { useState, useEffect, useRef, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import axios from "axios";
import "./style/Map.css";
import { ReactComponent as MapSvg } from "./map.optimized.svg";

function Map() {
  // State variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [playerHome, setPlayerHome] = useState<any>(null);
  const [structures, setStructures] = useState<any[]>([]);

  // Ref for the map SVG
  const mapRef = useRef<SVGSVGElement | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async (endpoint: string, setter: (data: any) => void) => {
      try {
        const response = await axios.get(`http://localhost:3001/${endpoint}`);
        setter(response.data);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    const fetchPlayerHomeAndStructures = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:3001/get-player-home-and-structure",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setPlayerHome(response.data);
      } catch (error) {
        console.error("Error fetching player home and structures:", error);
      }
    };

    fetchData("locations", setLocations);
    fetchData("structures", setStructures);
    fetchPlayerHomeAndStructures();
  }, []);

  // Helper function to create SVG elements
  const createSvgElement = useCallback(
    (type: string, attributes: Record<string, any>) => {
      const element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        type,
      );
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === "textContent") element.textContent = value;
        else if (key === "onClick") element.addEventListener("click", value);
        else element.setAttribute(key, value.toString());
      });
      return element;
    },
    [],
  );

  // Create location elements on the map
  const createLocationElements = useCallback(
    (
      citiesGroup: SVGGElement,
      location: {
        id: string;
        x: number;
        y: number;
        fontSize: number;
        name: string;
      },
    ) => {
      if (!location || !location.id) return;

      const text = createSvgElement("text", {
        id: `location-${location.id}`,
        x: location.x,
        y: location.y,
        dy: "-1.5",
        "font-size": location.fontSize,
        textContent: location.name,
        onClick: (e: Event) => handleLocationClick(e, location),
      });
      citiesGroup.appendChild(text);

      const circle = createSvgElement("circle", {
        id: `circle-${location.id}`,
        cx: location.x,
        cy: location.y,
        r: 1,
        "data-id": location.id,
      });
      citiesGroup.appendChild(circle);
    },
    [createSvgElement],
  );

  // Create player home elements on the map
  const createPlayerHomeElements = useCallback(
    (
      citiesGroup: SVGGElement,
      playerHome: { id: string; x: number; y: number; name: string },
    ) => {
      if (!playerHome || !playerHome.id) return;

      const text = createSvgElement("text", {
        id: `playerHome-${playerHome.id}`,
        x: playerHome.x,
        y: playerHome.y,
        dy: "-1.5",
        "font-size": "10",
        textContent: playerHome.name,
        onClick: (e: Event) =>
          handleLocationClick(e, { ...playerHome, type: "playerHome" }),
      });
      citiesGroup.appendChild(text);

      const circle = createSvgElement("circle", {
        id: `circle-${playerHome.id}`,
        cx: playerHome.x,
        cy: playerHome.y,
        r: 0.5,
        "data-id": playerHome.id,
      });
      citiesGroup.appendChild(circle);
    },
    [createSvgElement],
  );

  // Create map elements when locations and playerHome are loaded
  useEffect(() => {
    if (mapRef.current) {
      const citiesGroup = mapRef.current.querySelector("#cities");
      if (citiesGroup instanceof SVGGElement) {
        locations.forEach((location) =>
          createLocationElements(citiesGroup, location),
        );
        if (playerHome) createPlayerHomeElements(citiesGroup, playerHome);
      }
    }
  }, [locations, playerHome, createLocationElements, createPlayerHomeElements]);

  // Handle location click event
  const handleLocationClick = (e: Event, location: any) => {
    e.preventDefault();
    setIsModalOpen(true);
    setSelectedLocation(location);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  };

  // Render modal content based on location type
  const renderModalContent = () => {
    if (!selectedLocation) return null;

    return (
      <div className="modal-content">
        <header>
          <h2>{selectedLocation.name}</h2>
        </header>
        {selectedLocation.type === "village" && renderVillageContent()}
        {selectedLocation.type === "playerHome" && renderPlayerHomeContent()}
        <button onClick={closeModal}>Close</button>
      </div>
    );
  };

  // Render village content in modal
  const renderVillageContent = () => (
    <>
      <div className="modal-image">
        <img src={selectedLocation.image} alt={selectedLocation.name} />
      </div>
      <div className="modal-info">
        <p>Popolazione: {selectedLocation.population}</p>
        <p>Produzione: {selectedLocation.mainProduct}</p>
      </div>
    </>
  );

  // Render player home content in modal
  const renderPlayerHomeContent = () => (
    <div className="modal-structures">
      <div className="modal-image">
        <img src={selectedLocation.image} alt={selectedLocation.name} />
      </div>
      <h3>Structures:</h3>
      <div className="structure-cards">
        {selectedLocation.structureIds &&
        selectedLocation.structureIds.length > 0 ? (
          selectedLocation.structureIds.map((structureId: string) => {
            console.log("aaaaaa", structures);

            const structure = structures.find((s) => s.id === structureId);

            if (!structure) return null;

            return (
              <div key={structureId} className="structure-card">
                <h4>{structure.type}</h4>
                <div className="structure-content">
                  <img src={structure.image} alt={structure.type} />
                  <div className="structure-details">
                    <p>Level: {structure.level}</p>
                    <p>{structure.description}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="structure-card empty-card">
            <div className="structure-content">
              <span className="add-symbol">+</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render the map component
  return (
    <div className="map-wrapper">
      <h1>Benvenuti nella Mappa Interattiva</h1>
      <TransformWrapper
        initialScale={1}
        initialPositionX={0}
        initialPositionY={0}
        centerOnInit={true}
        minScale={1.05}
        maxScale={20}
        limitToBounds={true}
      >
        <TransformComponent wrapperClass="map-container">
          <MapSvg className="map-image" ref={mapRef} />
        </TransformComponent>
      </TransformWrapper>

      {isModalOpen && <div className="modal">{renderModalContent()}</div>}
    </div>
  );
}

export default Map;
