//
// (C) Copyright 2003-2019 by Autodesk, Inc.
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE. AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
//
// Use, duplication, or disclosure by the U.S. Government is subject to
// restrictions set forth in FAR 52.227-19 (Commercial Computer
// Software - Restricted Rights) and DFAR 252.227-7013(c)(1)(ii)
// (Rights in Technical Data and Computer Software), as applicable.
//


using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel;
using System.Windows.Forms;

using Autodesk.Revit;
using Autodesk.Revit.DB;

namespace Revit.SDK.Samples.BoundaryConditions.CS
{
    /// <summary>
    /// BoundaryConditions Type Enumeration
    /// </summary>
    public enum BCType
    {
        /// <summary>
        /// Point BC
        /// </summary>
        Point = 0,

        /// <summary>
        /// Line BC
        /// </summary>
        Line,

        /// <summary>
        /// Area BC
        /// </summary>
        Area
    };

    /// <summary>
    /// BoundaryConditions State Enumeration
    /// </summary>
    public enum BCState
    {
        /// <summary>
        /// the state of current BC is fixed
        /// </summary>
        Fixed = 0,

        /// <summary>
        /// the state of current BC is Pinned
        /// </summary>
        Pinned,

        /// <summary>
        /// the state of current BC is Roller
        /// </summary>
        Roller,

        /// <summary>
        /// the state of current BC is decided by user
        /// </summary>
        User
    };

    /// <summary>
    /// BoundaryConditions Translation/Rotation Enumeration
    /// </summary>
    public enum BCTranslationRotation
    {
        /// <summary>
        /// the BC is fixed, can used when any  BCState
        /// </summary>
        Fixed = 0,

        /// <summary>
        /// the BC's Translation/Rotation can released
        /// </summary>
        Released,

        /// <summary>
        /// user can set the BC's Translation/Rotation spring  modulus. 
        /// Only can be used when the BCState is User
        /// </summary>
        Spring,
    };
 
    /// <summary>
    /// A custom attribute to allow a target to have a pet.
    /// this attribute is about the BoundaryConditions Type Enumeration
    /// </summary>
    public sealed class BCTypeAttribute : Attribute
    { 
        // Keep a variable internally ...
        private BCType[] m_bCTypes;

        /// <summary>
        /// The constructor is called when the attribute is set.
        /// </summary>
        /// <param name="bcTypes"></param>
        public BCTypeAttribute(BCType[] bcTypes)
        {
            m_bCTypes = bcTypes;
        }

        /// <summary>
        /// property get or set internal variable m_bcTypes
        /// </summary>
        public BCType[] BCType
        {
            get
            {
                return m_bCTypes;
            }
            set
            {
                m_bCTypes = value;
            }
        }

        /// <summary>
        /// override Equals method
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public override bool Equals(object obj)
        {
            BCTypeAttribute temp = obj as BCTypeAttribute;
            if (null == temp)
            {
                return false;
            }

            foreach (BCType t1 in temp.BCType)
            {
                foreach (BCType t2 in m_bCTypes)
                {
                    if (t1 == t2)
                    {
                        return true;
                    }
                }
            }

            return false;
        }

        /// <summary>
        /// override GetHashCode method
        /// </summary>
        /// <returns></returns>
        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }

    /// <summary>
    /// use to create instance as the display object of the PropertyGrid
    /// </summary>
    public class BCProperties
    {
        // the boundary conditions of which the information will displayed in the UI grid
        private Autodesk.Revit.DB.Structure.BoundaryConditions m_bC;

        #region "Properties"

        /// <summary>
        /// BoundaryConditions Type
        /// this item will be displayed no matter the point BC,line BC or area BC 
        /// </summary>
        [Category("Structural Analysis"),ReadOnly(true),
        BCType(new BCType[] { BCType.Point, BCType.Line, BCType.Area })]
        public BCType BoundaryConditionsType
        {
            get
            {
                return (BCType)GetParameterValue("Boundary Conditions Type", GroupTypeId.StructuralAnalysis);
            }
            set
            {
                SetParameterValue("Boundary Conditions Type", GroupTypeId.StructuralAnalysis, value);
            }
        }

        /// <summary>
        /// BoundaryConditions State
        /// </summary>
        [Category("Structural Analysis"),
        BCType(new BCType[] { BCType.Point, BCType.Line, BCType.Area })]
        public BCState State
        {
            get
            {
                return (BCState)GetParameterValue("State",  GroupTypeId.StructuralAnalysis);
            }
            // Point BC includes Fixed, Pinned, Roller and User four different State; 
            // Line BC includes Fixed, Pinned and User; 
            // while the Area BC includes Pinned and User.
            set
            {
                if (BCType.Area == BoundaryConditionsType)
                {
                    if (BCState.Fixed != value && BCState.Roller != value)
                    {
                        SetParameterValue("State",  GroupTypeId.StructuralAnalysis, value);
                    }
                }
                else if (BCType.Line == BoundaryConditionsType)
                {
                    if (BCState.Roller != value)
                    {
                        SetParameterValue("State",  GroupTypeId.StructuralAnalysis, value); ;
                    }
                }
                else if (BCType.Point == BoundaryConditionsType)
                {
                    SetParameterValue("State",  GroupTypeId.StructuralAnalysis, value); ;
                }

                // other parameters do corresponding change when the State is changed.
                MatchBCValuesRule();
            }
        }
        
        /// <summary>
        /// BoundaryConditions XTranslation
        /// </summary>
        [Description("This value can be edit under User state"),Category("Translation in"),
        BCType(new BCType[]{BCType.Point, BCType.Line, BCType.Area})]
        public BCTranslationRotation XTranslation
        {
            get
            {
                return (BCTranslationRotation)GetParameterValue("X Translation", GroupTypeId.TranslationIn);
            }
            set
            {
                if (BCState.User == State)
                {
                    SetParameterValue("X Translation", GroupTypeId.TranslationIn, value);
                }       
            }
        }

        /// <summary>
        /// BoundaryConditions SpringModulus about XTranslation
        /// </summary>
        [Category("Translation in")]
        public double XTranslationSpringModulus
        {
            get
            {
                return (double)GetParameterValue("X Spring Modulus", GroupTypeId.TranslationIn);
            }
            set
            {
                SetParameterValue("X Spring Modulus", GroupTypeId.TranslationIn, value);
            }
        }

        /// <summary>
        /// BoundaryCondition YTranslation
        /// </summary>
        [Description("This value can be edit under User state"),Category("Translation in"),
         BCType(new BCType[] { BCType.Point, BCType.Line, BCType.Area })]
        public BCTranslationRotation YTranslation
        {
            get
            {
                return (BCTranslationRotation)GetParameterValue("Y Translation", GroupTypeId.TranslationIn);
            }
            set
            {
                if (BCState.User == State)
                {
                    SetParameterValue("Y Translation", GroupTypeId.TranslationIn, value);
                }
            }
        }

        /// <summary>
        /// BoundaryConditions SpringModulus about YTranslation
        /// </summary>
        [Category("Translation in")]
        public double YTranslationSpringModulus
        {
            get
            {
                return (double)GetParameterValue("Y Spring Modulus", GroupTypeId.TranslationIn);
            }
            set
            {
                SetParameterValue("Y Spring Modulus", GroupTypeId.TranslationIn, value);
            }
        }

        /// <summary>
        /// BoundaryConditions ZTranslation
        /// </summary>
        [Description("This value can be edit under User state"), Category("Translation in"), 
        BCType(new BCType[] { BCType.Point, BCType.Line, BCType.Area })]
        public BCTranslationRotation ZTranslation
        {
            get
            {
                return (BCTranslationRotation)GetParameterValue("Z Translation", GroupTypeId.TranslationIn);
            }
            set
            {
                if (BCState.User == State)
                {
                    SetParameterValue("Z Translation", GroupTypeId.TranslationIn, value);
                }
            }
        }

        /// <summary>
        /// BoundaryConditions SpringModulus about ZTranslation
        /// </summary>
        [Category("Translation in")]
        public double ZTranslationSpringModulus
        {
            get
            {
                return (double)GetParameterValue("Z Spring Modulus", GroupTypeId.TranslationIn);
            }
            set
            {
                SetParameterValue("Z Spring Modulus", GroupTypeId.TranslationIn, value);
            }
        }

        /// <summary>
        /// BoundaryConditions XRotation
        /// only displayed when the BC Type is point or line
        /// </summary>
        [Description("This value can be edit under User state"), Category("Rotation about"), 
        BCType(new BCType[] { BCType.Point, BCType.Line})]
        public BCTranslationRotation XRotation
        {
            get
            {
                return (BCTranslationRotation)GetParameterValue("X Rotation", GroupTypeId.RotationAbout);
            }
            set
            {
                if (BCState.User == State)
                {
                    SetParameterValue("X Rotation", GroupTypeId.RotationAbout, value);
                }
            }
        }

        /// <summary>
        /// BoundaryConditions SpringModulus about XRotation
        /// </summary>
        [Category("Rotation about")]
        public double XRotationSpringModulus
        {
            get
            {
                return (double)GetParameterValue("X Spring Modulus", GroupTypeId.RotationAbout);
            }
            set
            {
                SetParameterValue("X Spring Modulus", GroupTypeId.RotationAbout, value);
            }
        }

        /// <summary>
        /// BoundaryConditions YRotation
        /// Only be displayed when the BC Type is point
        /// </summary>
        [ Description("This value can be edit under User state"),Category("Rotation about"), 
        BCType(new BCType[] { BCType.Point})]
        public BCTranslationRotation YRotation
        {
            get
            {
                return (BCTranslationRotation)GetParameterValue("Y Rotation", GroupTypeId.RotationAbout);
            }
            set
            {
                if (BCState.User == State)
                {
                    SetParameterValue("Y Rotation", GroupTypeId.RotationAbout, value);
                }
            }
        }

        /// <summary>
        /// BoundaryConditions SpringModulus about YRotation
        /// </summary>
        [Category("Rotation about")]
        public double YRotationSpringModulus
        {
            get
            {
                return (double)GetParameterValue("Y Spring Modulus", GroupTypeId.RotationAbout);
            }
            set
            {
                SetParameterValue("Y Spring Modulus", GroupTypeId.RotationAbout, value);
            }
        }

        /// <summary>
        /// BoundaryConditions ZRotation
        /// </summary>
        [Description("This value can be edit under User state"), 
        Category("Rotation about"),BCType(new BCType[] { BCType.Point })]
        public BCTranslationRotation ZRotation
        {
            get
            {
                return (BCTranslationRotation)GetParameterValue("Z Rotation", GroupTypeId.RotationAbout);
            }
            set
            {
                if (BCState.User == State)
                {
                    SetParameterValue("Z Rotation", GroupTypeId.RotationAbout, value);
                }
            }
        }

        /// <summary>
        /// BoundaryConditions SpringModulus about ZRotation
        /// </summary>
        [Category("Rotation about")]
        public double  ZRotationSpringModulus
        {
            get
            {
                return (double)GetParameterValue("Z Spring Modulus",
                        GroupTypeId.RotationAbout);
            }
            set
            {
                SetParameterValue("Z Spring Modulus", GroupTypeId.RotationAbout, value);
            }
        }

        #endregion

        #region "Methods"

        /// <summary>
        /// constructor  
        /// </summary>
        /// <param name="bC">
        /// the boundary conditions of which the information will displayed in the UI grid
        /// </param>
        public BCProperties(Autodesk.Revit.DB.Structure.BoundaryConditions bC)
        {
            m_bC = bC;
        }

        /// <summary>
        /// When Spring is selected for Translation/Rotation the user enter a positive value 
        /// greater than Zero as the corresponding Spring Modulus. 
        /// And according to its display unit do the conversion between display value and inside value.
        /// </summary>
        /// <param name="gridItemLabel">the name of parameter which value is spring</param>
        public void SetSpringModulus(string gridItemLabel)
        {
            using (SpringModulusForm springModulusForm = new SpringModulusForm())
            {
                // judge current conversion rule between the display value and inside value
                if (BCType.Point == BoundaryConditionsType)
                {
                    if (gridItemLabel.Contains("Translation"))
                    {
                        springModulusForm.Conversion = UnitConversion.UnitDictionary["PTSpringModulusConver"];
                    }
                    else if (gridItemLabel.Contains("Rotation"))
                    {
                        springModulusForm.Conversion = UnitConversion.UnitDictionary["PRSpringModulusConver"];
                    }
                }
                else if (BCType.Line == BoundaryConditionsType)
                {
                    if (gridItemLabel.Contains("Translation"))
                    {
                        springModulusForm.Conversion = UnitConversion.UnitDictionary["LTSpringModulusConver"];
                    }
                    else if (gridItemLabel.Contains("Rotation"))
                    {
                        springModulusForm.Conversion = UnitConversion.UnitDictionary["LRSpringModulusConver"];
                    }
                }
                else if (BCType.Area == BoundaryConditionsType && gridItemLabel.Contains("Translation"))
                {
                    springModulusForm.Conversion = UnitConversion.UnitDictionary["ATSpringModulusConver"];
                }

                // get the old value
                if ("XTranslation" == gridItemLabel)
                {
                    springModulusForm.OldStringModulus = XTranslationSpringModulus;
                }
                else if ("YTranslation" == gridItemLabel)
                {
                    springModulusForm.OldStringModulus = YTranslationSpringModulus;
                }
                else if ("ZTranslation" == gridItemLabel)
                {
                    springModulusForm.OldStringModulus = ZTranslationSpringModulus;
                }
                else if ("XRotation" == gridItemLabel)
                {
                    springModulusForm.OldStringModulus = XRotationSpringModulus;
                }
                else if ("YRotation" == gridItemLabel)
                {
                    springModulusForm.OldStringModulus = YRotationSpringModulus;
                }
                else if ("ZRotation" == gridItemLabel)
                {
                    springModulusForm.OldStringModulus = ZRotationSpringModulus;
                }

                // show the spring modulus dialog to ask a positive number
                DialogResult result = springModulusForm.ShowDialog();

                // set the user input number as the new value
                if (DialogResult.OK == result)
                {
                    if ("XTranslation" == gridItemLabel)
                    {
                        XTranslationSpringModulus = springModulusForm.StringModulus;
                    }
                    else if ("YTranslation" == gridItemLabel)
                    {
                        YTranslationSpringModulus = springModulusForm.StringModulus;
                    }
                    else if ("ZTranslation" == gridItemLabel)
                    {
                        ZTranslationSpringModulus = springModulusForm.StringModulus;
                    }
                    else if ("XRotation" == gridItemLabel)
                    {
                        XRotationSpringModulus = springModulusForm.StringModulus;
                    }
                    else if ("YRotation" == gridItemLabel)
                    {
                        YRotationSpringModulus = springModulusForm.StringModulus;
                    }
                    else if ("ZRotation" == gridItemLabel)
                    {
                        ZRotationSpringModulus = springModulusForm.StringModulus;
                    }
                }
            }
        }

        /// <summary>
        /// get parameter via matching the appointed name and group.
        /// and deal with it according to the type of Parameter's StorageType
        /// </summary>
        protected Object GetParameterValue(string parameterName, ForgeTypeId parameterGroup)
        {
            ParameterSet parameters = m_bC.Parameters;
            foreach (Parameter parameter in parameters)
            {
                // find the parameter of which the name is the same as the param name
                if ((parameterName != parameter.Definition.Name) || 
                    (parameterGroup != parameter.Definition.GetGroupTypeId()))
                {
                    continue;
                }

                // get the parameter value
                switch (parameter.StorageType)
                {
                    case StorageType.Double:
                        return parameter.AsDouble();
                    case StorageType.Integer:
                        return parameter.AsInteger();
                    case StorageType.ElementId:
                        return parameter.AsElementId();
                    case StorageType.String:
                        return parameter.AsString();
                    case StorageType.None:
                        return parameter.AsValueString();
                    default:
                        return null;
                }
            }

            return null;
        }

        /// <summary>
        /// when user changed the parameter value via the UI set this changed parameter value
        /// </summary>
        /// <param name="parameterName">the name of the changed parameter</param>
        /// <param name="parameterGroup">
        /// because some parameters of boundary conditions have the same name
        /// </param>
        /// <param name="value">the new parameter value</param>
        protected void SetParameterValue(string parameterName,
                                         ForgeTypeId parameterGroup, 
                                         Object value)
        {
            ParameterSet parameters = m_bC.Parameters;
            foreach (Parameter parameter in parameters)
            {
                // find the parameter of which the name is the same as the param name
                if ((parameterName != parameter.Definition.Name) ||
                    (parameterGroup != parameter.Definition.GetGroupTypeId()))
                {
                    continue;
                }

                // get the parameter value
                switch (parameter.StorageType)
                {
                    case StorageType.Double:
                        parameter.Set((double)value);
                        break;
                    case StorageType.Integer:
                        parameter.Set((int)value);
                        break;
                    case StorageType.ElementId:
                        Autodesk.Revit.DB.ElementId Id = (Autodesk.Revit.DB.ElementId)value;
                        parameter.Set(Id);
                        break;
                    case StorageType.String:
                        parameter.Set(value as string);
                        break;
                    case StorageType.None:
                        parameter.SetValueString(value as string);
                        break;
                    default:
                        break;
                }
            }
        }

        /// <summary>
        /// the BC parameter values rules according to the Revit main program.
        /// For example, when the State is Fixed all the Translation/Rotation parameters are Fixed too.
        /// </summary>
        private void MatchBCValuesRule()
        {
            if (BCState.Fixed == State)
            {
                XTranslation = BCTranslationRotation.Fixed;
                YTranslation = BCTranslationRotation.Fixed;
                ZTranslation = BCTranslationRotation.Fixed;
                XRotation    = BCTranslationRotation.Fixed;
                YRotation    = BCTranslationRotation.Fixed;
                ZRotation    = BCTranslationRotation.Fixed;
            }
            else if (BCState.Pinned == State)
            {
                XTranslation = BCTranslationRotation.Fixed;
                YTranslation = BCTranslationRotation.Fixed;
                ZTranslation = BCTranslationRotation.Fixed;
                ZRotation    = BCTranslationRotation.Released;
                YRotation    = BCTranslationRotation.Released;
                ZRotation    = BCTranslationRotation.Released;
            }
            else if (BCState.Roller == State)
            {
                XTranslation = BCTranslationRotation.Released;
                YTranslation = BCTranslationRotation.Released;
                ZTranslation = BCTranslationRotation.Fixed;
                XRotation    = BCTranslationRotation.Released;
                YRotation    = BCTranslationRotation.Released;
                ZRotation    = BCTranslationRotation.Released;
            }
        }

        #endregion
    }
}
