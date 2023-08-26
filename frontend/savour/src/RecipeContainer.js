import { Link } from 'react-router-dom';
// import useToggleState from './hooks/useToggleState.js';
import ShowHideBtnAndText from './ShowHideBtnAndText.js';
import './RecipeContainer.css';

/**
 * RecipeContainer
 * Creates div with recipe content
 * Props: showHide, recipeArray
*/
const RecipeContainer = ({ showHide = false, recipeArray = [] }) => {
  // const styles = {
  //   color,
  //   fontSize
  // }
  // console.log("RecipeContainer");
  // console.log("recipeArray.length", recipeArray.length);
  // console.log("recipeArray", recipeArray);
  // console.log("recipeArray", recipeArray[0].id);
  return (
    <>
      {
        recipeArray.length &&
        recipeArray.map(recipe => (
          <div key={recipe.id} className="RecipeContainer-recipe">
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