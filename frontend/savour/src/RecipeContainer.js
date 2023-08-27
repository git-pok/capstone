import { useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from './context/UserContext.js';
// import useToggleState from './hooks/useToggleState.js';
import ShowHideBtnAndText from './ShowHideBtnAndText.js';
import './RecipeContainer.css';

/**
 * RecipeContainer
 * Creates div with recipe content
 * Props: showHide, recipeArray
*/
const RecipeContainer = ({ showHide = false, recipeArray = [] }) => {
  const { usrData, setUsrData } = useContext(UserContext);
  // const disLikstyles = {
  //   like_user_ids: "3px solid green",
  //   disliked_user_ids: "3px solid red"
  // }
  return (
    <>
      {
        recipeArray.length &&
        recipeArray.map(recipe => (
          <div style={
              recipe.liked_user_ids.includes(usrData.userId)
              ? { border: "2px solid green" }
              : null
            }
            key={recipe.id}
            className="RecipeContainer-recipe">
            <Link exact="true" to={`recipes/${recipe.id}`}>
              <h3>{recipe.name}</h3>
            </Link>
            <h3>By {recipe.author}</h3>
            <img src={recipe.image}></img>
            { showHide ?
              <ShowHideBtnAndText paragraphArr={[
                {text: `Prep Time: ${recipe.prep_time}`},
                {text: `Cook Time: ${recipe.cook_time}`},
                {text: `${recipe.description}`}
              ]} /> :
              <>
                <p className="RecipeContainer-recipe-p">Prep Time: {recipe.prep_time}</p>
                <p className="RecipeContainer-recipe-p">Cook Time: {recipe.cook_time}</p>
                <p className="RecipeContainer-recipe-p">{recipe.description}</p>
              </>
            }
          </div>
          ))
      }
    </>
  );
}

export default RecipeContainer;