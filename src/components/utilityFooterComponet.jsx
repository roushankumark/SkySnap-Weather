import React from "react";
import jQuery from "jquery";

const UtilityComponent = (props) => {
  const closeUtilityComponent = () => {
    jQuery(($) => {
      $.noConflict();
      $(".cmp").addClass("d-none");
      $(".utility-component").removeClass("add-utility-component-height");
    });
  };

  return (
    <React.Fragment>
      {/*
        IMPORTANT: No Bootstrap flex/layout classes here.
        The utility-component is hidden (height:0, overflow:hidden) by default.
        Only .add-utility-component-height makes it visible.
        The old classes (align-items-center, m-auto, width-toggle-3) were
        causing a permanent dark block to render even when collapsed.
      */}
      <section
        className="utility-component"
        id="utilityComponent"
      >
        <div
          className="utility-notch"
          onClick={closeUtilityComponent}
          role="button"
          aria-label="Close search"
        />
        {props.tags}
      </section>
    </React.Fragment>
  );
};

export default UtilityComponent;
