import React from "react";

function Profile({ params }) {
  return (
    <div>
      <h1>Profile Page</h1>
      <h2>{params.id}</h2>
    </div>
  );
}

export default Profile;
