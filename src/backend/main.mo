import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Material = {
    code : Text;
    description : Text;
    weight : Float;
    minWeight : Float;
    maxWeight : Float;
    quantity : Nat;
  };

  module Material {
    public func compare(material1 : Material, material2 : Material) : Order.Order {
      Text.compare(material1.code, material2.code);
    };
  };

  type LabelLog = {
    materialCode : Text;
    actualWeight : Float;
    timestamp : Time.Time;
    user : Principal;
  };

  module LabelLog {
    public func compare(labelLog1 : LabelLog, labelLog2 : LabelLog) : Order.Order {
      switch (Text.compare(labelLog1.materialCode, labelLog2.materialCode)) {
        case (#equal) { Int.compare(labelLog1.timestamp, labelLog2.timestamp) };
        case (order) { order };
      };
    };

    public func compareByTimestamp(labelLog1 : LabelLog, labelLog2 : LabelLog) : Order.Order {
      Int.compare(labelLog1.timestamp, labelLog2.timestamp);
    };

    public func compareByUser(labelLog1 : LabelLog, labelLog2 : LabelLog) : Order.Order {
      Principal.compare(labelLog1.user, labelLog2.user);
    };
  };

  let materials = Map.empty<Text, Material>();
  let labelLogs = Map.empty<Text, [LabelLog]>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func addOrUpdateMaterial(
    code : Text,
    description : Text,
    weight : Float,
    minWeight : Float,
    maxWeight : Float,
    quantity : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can add or update materials");
    };
    if (minWeight > maxWeight) {
      Runtime.trap("minWeight cannot be greater than maxWeight");
    };

    let material = {
      code;
      description;
      weight;
      minWeight;
      maxWeight;
      quantity;
    };
    materials.add(code, material);
  };

  public query func getMaterial(code : Text) : async ?Material {
    materials.get(code);
  };

  public query func getAllMaterials() : async [Material] {
    materials.values().toArray().sort();
  };

  public shared ({ caller }) func bulkImportMaterials(materialsArray : [Material]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can bulk import materials");
    };

    for (material in materialsArray.values()) {
      materials.add(material.code, material);
    };
  };

  public shared ({ caller }) func deleteMaterial(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can delete materials");
    };

    if (not materials.containsKey(code)) {
      Runtime.trap("Material with code " # code # " does not exist");
    };
    materials.remove(code);
  };

  public shared ({ caller }) func generateLabel(materialCode : Text, actualWeight : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate labels");
    };

    switch (materials.get(materialCode)) {
      case (null) { Runtime.trap("Material not found") };
      case (?material) {
        if (actualWeight < material.minWeight or actualWeight > material.maxWeight) {
          Runtime.trap(
            "Weight " # actualWeight.toText() #
            " is out of range [" # material.minWeight.toText() #
            ", " # material.maxWeight.toText() # "]"
          );
        };
      };
    };

    let timestamp = Time.now();
    let log = {
      materialCode;
      actualWeight;
      timestamp;
      user = caller;
    };

    switch (labelLogs.get(materialCode)) {
      case (?logs) {
        labelLogs.add(materialCode, logs.concat([log]));
      };
      case (null) {
        labelLogs.add(materialCode, [log]);
      };
    };
  };

  public query ({ caller }) func getAllLabelLogs() : async [LabelLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can view all label logs");
    };

    labelLogs.values().toArray().flatten().sort();
  };

  public query ({ caller }) func getMaterialLabelLogs(materialCode : Text) : async [LabelLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can view label logs");
    };

    switch (labelLogs.get(materialCode)) {
      case (?logs) { logs };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func clearAllMaterials() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can clear all materials");
    };

    materials.clear();
  };

  public shared ({ caller }) func clearAllLabelLogs() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can clear all label logs");
    };

    labelLogs.clear();
  };
};
