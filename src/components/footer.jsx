import React from "react";
import FooterNav from "./footerNav";
import UtilityComponent from "./utilityFooterComponet";

/* 
  IMPORTANT: This component renders two separate fixed/absolute elements:
  1. .utility-component   — the slide-up search drawer (fixed, bottom 0)
  2. .footer-nav-container — the floating pill nav (fixed, bottom 24px)
  
  There is NO wrapper div to avoid the "extra black box" issue.
*/
const Footer = (props) => {
  return (
    <React.Fragment>
      <UtilityComponent tags={props.utilityTags} />
      <footer className="footer-nav-container">
        <FooterNav onClick={props.onClick} />
      </footer>
    </React.Fragment>
  );
};

export default Footer;
