import useToggleState from './hooks/useToggleState.js';
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
  return (
    <>
      {
        recipeArray !== null ?
        recipeArray.map(recipe => (
          <div key={recipe.id} className="RecipeContainer-recipe">
            <h3>{recipe.name}</h3>
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
          )) : null
      }
    </>
  );
}

export default RecipeContainer;