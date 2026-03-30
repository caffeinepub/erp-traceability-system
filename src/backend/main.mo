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

  // Migration: explicitly accept and discard the old accessControlState stable variable
  stable var accessControlState : AccessControl.AccessControlState = AccessControl.initState();

  system func postupgrade() {
    // discard the old accessControlState after upgrade
    accessControlState := AccessControl.initState();
  };

  let materials = Map.empty<Text, Material>();
  let labelLogs = Map.empty<Text, [LabelLog]>();

  public shared func addOrUpdateMaterial(
    code : Text,
    description : Text,
    weight : Float,
    minWeight : Float,
    maxWeight : Float,
    quantity : Nat,
  ) : async () {
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

  public shared func bulkImportMaterials(materialsArray : [Material]) : async () {
    for (material in materialsArray.values()) {
      materials.add(material.code, material);
    };
  };

  public shared func deleteMaterial(code : Text) : async () {
    if (not materials.containsKey(code)) {
      Runtime.trap("Material with code " # code # " does not exist");
    };
    materials.remove(code);
  };

  public shared ({ caller }) func generateLabel(materialCode : Text, actualWeight : Float) : async () {
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

  public query func getAllLabelLogs() : async [LabelLog] {
    labelLogs.values().toArray().flatten().sort();
  };

  public query func getMaterialLabelLogs(materialCode : Text) : async [LabelLog] {
    switch (labelLogs.get(materialCode)) {
      case (?logs) { logs };
      case (null) { [] };
    };
  };

  public shared func clearAllMaterials() : async () {
    materials.clear();
  };

  public shared func clearAllLabelLogs() : async () {
    labelLogs.clear();
  };
};
