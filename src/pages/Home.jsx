import React from "react";
import Button from "./../components/button";
import Img_1 from "./../assets/static/weather.jpg";
import Spinner from "./../components/spinner";
import navigate from "./../inc/scripts/utilities";
import { db } from "./../backend/app_backend";
import Swal from "sweetalert2";
import jQuery from "jquery";

const Home = () => {
  function click() {
    Swal.fire({
      title: "Set Default Location",
      html: "<input type='text' placeholder='Enter city name' class='form-control search-input mt-2' id='defaultLocation'>",
      confirmButtonText: "Save Location",
      confirmButtonColor: "#38bdf8",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      background: "rgba(15, 23, 42, 0.95)",
      color: "#fff",
      customClass: {
        popup: 'glass-popup'
      }
    }).then((willProceed) => {
      if (willProceed.isConfirmed) {
        jQuery(($) => {
          $.noConflict();
          const $defaultLocation = $("#defaultLocation").val().trim();

          if ($defaultLocation === undefined || $defaultLocation === "") {
            Swal.fire({
              title: "Invalid Location!",
              html: "<p class='text-center' style='color: #ef4444;'>Please enter a valid location</p>",
              confirmButtonColor: "#38bdf8",
              background: "rgba(15, 23, 42, 0.95)",
              color: "#fff",
              allowOutsideClick: false,
              allowEscapeKey: false,
              allowEnterKey: false,
              timer: 3000,
            });
          } else {
            Swal.fire({
              text: "Location saved successfully!",
              icon: "success",
              toast: true,
              position: "top",
              showConfirmButton: false,
              timer: 2000,
              background: "rgba(15, 23, 42, 0.95)",
              color: "#fff",
            });

            db.create("HOME_PAGE_SEEN", true);
            db.create("USER_DEFAULT_LOCATION", $defaultLocation);
            db.create("TRACK_SAVED_LOCATION_WEATHER", false);
            db.create("WEATHER_UNIT", "metric");
            navigate("weather");
          }
        });
      }
    });
  }

  return (
    <React.Fragment>
      <Spinner />
      <div className="home-page-wrapper" id="homePage">
        <div className="page-card d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: "500px", padding: "40px", textAlign: "center" }}>
          
          <main className="mb-4">
            <h1 className="fw-bold m-0" style={{ fontSize: "2.8rem", letterSpacing: "-1px", color: "#fff" }}>
              SkySnap
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", marginTop: "8px" }}>
              Professional Weather Dashboard
            </p>
          </main>

          <section className="img-container my-4">
            <img
              src={Img_1}
              className="img-fluid rounded-circle shadow-lg"
              style={{ width: "220px", height: "220px", objectFit: "cover", border: "4px solid rgba(255,255,255,0.15)" }}
              alt="weather app showcase"
            />
          </section>

          <Button
            text="Get Started"
            className="brand-btn mt-4"
            onClick={(event) => {
              click(event);
            }}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Home;
